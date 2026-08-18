package controllers

import (
	"ecommerce-backend/models"
	"fmt"
	"time"

	"ecommerce-backend/config"

	"github.com/gofiber/fiber/v2"
)

type CheckoutRequest struct {
	Amount float64 `json:"amount"`
}

func Checkout(c *fiber.Ctx) error {
	var req CheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userId := c.Query("userId", "user_test")

	// Create a mock order with "pending" status
	orderID := "ord_" + time.Now().Format("20060102150405")
	newOrder := models.Order{
		ID:          orderID,
		UserID:      userId,
		TotalAmount: req.Amount,
		Status:      "pending", // Wait for Laravel to callback
		CreatedAt:   time.Now(),
	}
	models.MockOrders = append(models.MockOrders, newOrder)

	gatewayURL := fmt.Sprintf("http://localhost:8000/payment?order_id=%s&amount=%.2f", orderID, req.Amount)

	return c.JSON(fiber.Map{
		"success": true,
		"order_id": orderID,
		"gateway_url": gatewayURL,
	})
}

func PaymentCallback(c *fiber.Ctx) error {
	var req map[string]string
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload"})
	}

	orderID := req["order_id"]
	status := req["status"] // "completed" or "failed"

	// Find and update order in Supabase
	var ignored []map[string]interface{}
	err := config.Supabase.DB.From("orders").Update(map[string]string{"status": status}).Eq("id", orderID).Execute(&ignored)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Failed to update order"})
	}

	return c.JSON(fiber.Map{"success": true})
}
