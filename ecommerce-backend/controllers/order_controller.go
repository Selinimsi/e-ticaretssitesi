package controllers

import (
	"ecommerce-backend/config"
	"ecommerce-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

type orderItemDB struct {
	ID              string  `json:"id,omitempty"`
	OrderID         string  `json:"order_id"`
	ProductID       string  `json:"product_id"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
}

type orderDB struct {
	ID            string    `json:"id,omitempty"`
	UserID        string    `json:"user_id"`
	TotalAmount   float64   `json:"total_amount"`
	Status        string    `json:"status"`
	PaymentMethod string    `json:"payment_method"`
	Address       string    `json:"address"`
	CreatedAt     time.Time `json:"created_at,omitempty"`
}

func GetUserOrders(c *fiber.Ctx) error {
	userID := c.Query("userId", "")
	sellerID := c.Query("sellerId", "")

	// 1. Fetch Orders
	var orders []orderDB
	var err error
	if userID != "" {
		err = config.Supabase.DB.From("orders").Select("*").Eq("user_id", userID).Execute(&orders)
	} else {
		err = config.Supabase.DB.From("orders").Select("*").Execute(&orders)
	}
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Failed to fetch orders"})
	}

	// 2. Fetch Order Items for these orders (this is simplified, ideally we'd use IN query or join)
	// Because supabase-go doesn't support complex joins easily yet, we'll fetch all items for the user's orders
	var finalOrders []models.Order
	for _, o := range orders {
		var items []orderItemDB
		_ = config.Supabase.DB.From("order_items").Select("*").Eq("order_id", o.ID).Execute(&items)

		var modelItems []models.OrderItem
		var sellerTotal float64
		hasSellerItem := false

		for _, item := range items {
			// Fetch product details to populate NameTR, NameEN, SellerID
			var prods []productDB
			_ = config.Supabase.DB.From("products").Select("*").Eq("id", item.ProductID).Execute(&prods)
			
			if len(prods) > 0 {
				p := prods[0]
				if sellerID != "" && p.SellerID != sellerID {
					continue // Skip if this is a seller view and product doesn't belong to them
				}
				if sellerID != "" && p.SellerID == sellerID {
					hasSellerItem = true
					sellerTotal += item.PriceAtPurchase * float64(item.Quantity)
				}
				
				modelItems = append(modelItems, models.OrderItem{
					ProductID: p.ID,
					NameTR:    p.NameTR,
					NameEN:    p.NameEN,
					Price:     item.PriceAtPurchase,
					Quantity:  item.Quantity,
					SellerID:  p.SellerID,
				})
			}
		}

		if sellerID != "" && !hasSellerItem {
			continue
		}

		totalAmount := o.TotalAmount
		if sellerID != "" {
			totalAmount = sellerTotal
		}

		finalOrders = append(finalOrders, models.Order{
			ID:            o.ID,
			UserID:        o.UserID,
			Address:       o.Address,
			PaymentMethod: o.PaymentMethod,
			TotalAmount:   totalAmount,
			Status:        o.Status,
			CreatedAt:     o.CreatedAt,
			Items:         modelItems,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    finalOrders,
	})
}

type OrderRequest struct {
	UserID          string  `json:"userId"`
	TotalAmount     float64 `json:"totalAmount"`
	ShippingAddress string  `json:"shippingAddress"`
	Phone           string  `json:"phone"`
	PaymentMethod   string  `json:"paymentMethod"`
	Items           []struct {
		ProductID string  `json:"productId"`
		Quantity  int     `json:"quantity"`
		Price     float64 `json:"price"`
	} `json:"items"`
}

func CreateOrder(c *fiber.Ctx) error {
	var req OrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Invalid request"})
	}

	status := "pending"
	if req.PaymentMethod == "Kapıda Ödeme" {
		status = "completed"
	}

	// 1. Insert Order
	newOrder := orderDB{
		UserID:        req.UserID,
		Address:       req.ShippingAddress,
		PaymentMethod: req.PaymentMethod,
		TotalAmount:   req.TotalAmount,
		Status:        status,
	}

	var savedOrders []orderDB
	err := config.Supabase.DB.From("orders").Insert(newOrder).Execute(&savedOrders)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	if len(savedOrders) == 0 {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Failed to create order: no rows returned (possibly RLS)"})
	}

	orderID := savedOrders[0].ID

	// 2. Insert Order Items
	for _, item := range req.Items {
		newOrderItem := orderItemDB{
			OrderID:         orderID,
			ProductID:       item.ProductID,
			Quantity:        item.Quantity,
			PriceAtPurchase: item.Price,
		}
		var ignored []orderItemDB
		_ = config.Supabase.DB.From("order_items").Insert(newOrderItem).Execute(&ignored)
		
		// 3. Decrement Stock
		// Simple fetch and update
		var prods []productDB
		if err := config.Supabase.DB.From("products").Select("*").Eq("id", item.ProductID).Execute(&prods); err == nil && len(prods) > 0 {
			p := prods[0]
			p.Stock = p.Stock - item.Quantity
			if p.Stock < 0 { p.Stock = 0 }
			var ign []productDB
			_ = config.Supabase.DB.From("products").Update(p).Eq("id", p.ID).Execute(&ign)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id": orderID,
		},
	})
}
