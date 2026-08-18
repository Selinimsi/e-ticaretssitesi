package controllers

import (
	"bytes"
	"ecommerce-backend/models"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func setupOrderApp() *fiber.App {
	app := fiber.New()
	
	models.MockOrders = []models.Order{
		{
			ID:          "ord_1",
			UserID:      "user_1",
			TotalAmount: 200.0,
			Status:      "completed",
			Items: []models.OrderItem{
				{ProductID: "prod_1", Price: 100.0, Quantity: 2, SellerID: "seller_1"},
			},
		},
		{
			ID:          "ord_2",
			UserID:      "user_2",
			TotalAmount: 150.0,
			Status:      "pending",
			Items: []models.OrderItem{
				{ProductID: "prod_2", Price: 150.0, Quantity: 1, SellerID: "seller_2"},
			},
		},
	}

	app.Get("/api/orders", GetUserOrders)
	app.Post("/api/orders", CreateOrder)
	return app
}

func TestGetUserOrders(t *testing.T) {
	app := setupOrderApp()

	req := httptest.NewRequest("GET", "/api/orders?userId=user_1", nil)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.True(t, result["success"].(bool))
	data := result["data"].([]interface{})
	assert.Equal(t, 1, len(data))
	assert.Equal(t, "ord_1", data[0].(map[string]interface{})["id"])
}

func TestGetSellerOrders(t *testing.T) {
	app := setupOrderApp()

	req := httptest.NewRequest("GET", "/api/orders?sellerId=seller_2", nil)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.True(t, result["success"].(bool))
	data := result["data"].([]interface{})
	assert.Equal(t, 1, len(data))
	assert.Equal(t, "ord_2", data[0].(map[string]interface{})["id"])
}

func TestCreateOrder(t *testing.T) {
	app := setupOrderApp()

	reqBody := map[string]interface{}{
		"userId":          "user_1",
		"totalAmount":     300.0,
		"shippingAddress": "Test Addr",
		"paymentMethod":   "Kapıda Ödeme",
		"items": []map[string]interface{}{
			{"productId": "prod_1", "quantity": 1, "price": 300.0},
		},
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest("POST", "/api/orders", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.True(t, result["success"].(bool))
	assert.NotEmpty(t, result["data"].(map[string]interface{})["id"])
}
