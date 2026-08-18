package controllers

import (
	"ecommerce-backend/config"
	"ecommerce-backend/models"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type couponDB struct {
	ID           string    `json:"id,omitempty"`
	Code         string    `json:"code"`
	Type         string    `json:"type"`
	Value        float64   `json:"value"`
	MinCartValue float64   `json:"min_cart_value"`
	ExpiryDate   time.Time `json:"expiry_date"`
	IsActive     bool      `json:"is_active"`
}

type flashSaleDB struct {
	ID          string      `json:"id,omitempty"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	StartTime   time.Time   `json:"start_time"`
	EndTime     time.Time   `json:"end_time"`
	ProductIDs  interface{} `json:"product_ids"`
	DiscountPct float64     `json:"discount_pct"`
	IsActive    bool        `json:"is_active"`
}

// ValidateCoupon checks if a coupon is valid and returns its value
func ValidateCoupon(c *fiber.Ctx) error {
	type Request struct {
		Code      string  `json:"code"`
		CartTotal float64 `json:"cartTotal"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Geçersiz istek"})
	}

	code := strings.ToUpper(strings.TrimSpace(req.Code))

	var coupons []couponDB
	err := config.Supabase.DB.From("coupons").Select("*").Eq("code", code).Execute(&coupons)
	if err != nil || len(coupons) == 0 {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Geçersiz kupon kodu"})
	}

	coupon := coupons[0]

	if !coupon.IsActive {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Bu kupon artık aktif değil"})
	}
	if time.Now().After(coupon.ExpiryDate) {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Bu kuponun süresi dolmuş"})
	}
	if req.CartTotal < coupon.MinCartValue {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Sepet tutarı bu kupon için yetersiz"})
	}

	// Valid coupon
	return c.JSON(fiber.Map{
		"success": true,
		"data": map[string]interface{}{
			"id":           coupon.ID,
			"code":         coupon.Code,
			"type":         coupon.Type,
			"value":        coupon.Value,
			"minCartValue": coupon.MinCartValue,
			"isActive":     coupon.IsActive,
		},
	})
}

// GetFlashSales returns active flash sales
func GetFlashSales(c *fiber.Ctx) error {
	var sales []flashSaleDB
	err := config.Supabase.DB.From("flash_sales").Select("*").Eq("is_active", "true").Execute(&sales)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Failed to fetch flash sales"})
	}

	var activeSales []map[string]interface{}
	now := time.Now()

	for _, sale := range sales {
		if now.After(sale.StartTime) && now.Before(sale.EndTime) {
			activeSales = append(activeSales, map[string]interface{}{
				"id":          sale.ID,
				"title":       sale.Title,
				"description": sale.Description,
				"startTime":   sale.StartTime,
				"endTime":     sale.EndTime,
				"productIds":  sale.ProductIDs,
				"discountPct": sale.DiscountPct,
				"isActive":    sale.IsActive,
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    activeSales,
	})
}

type abandonedCartDB struct {
	ID          string      `json:"id,omitempty"`
	UserID      string      `json:"user_id"`
	Items       interface{} `json:"items"`
	TotalAmount float64     `json:"total_amount"`
	LastUpdated time.Time   `json:"last_updated,omitempty"`
}

// AbandonCart logs a user's cart if they leave it
func AbandonCart(c *fiber.Ctx) error {
	type Request struct {
		UserID      string             `json:"userId"`
		Items       []models.OrderItem `json:"items"`
		TotalAmount float64            `json:"totalAmount"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Geçersiz istek"})
	}

	if req.UserID == "" || len(req.Items) == 0 {
		return c.JSON(fiber.Map{"success": true}) // nothing to save
	}

	// Check if exists
	var existing []abandonedCartDB
	_ = config.Supabase.DB.From("abandoned_carts").Select("*").Eq("user_id", req.UserID).Execute(&existing)

	if len(existing) > 0 {
		// Update
		var ign []abandonedCartDB
		_ = config.Supabase.DB.From("abandoned_carts").Update(map[string]interface{}{
			"items":        req.Items,
			"total_amount": req.TotalAmount,
			"last_updated": time.Now(),
		}).Eq("user_id", req.UserID).Execute(&ign)
	} else {
		// Insert
		var ign []abandonedCartDB
		_ = config.Supabase.DB.From("abandoned_carts").Insert(abandonedCartDB{
			UserID:      req.UserID,
			Items:       req.Items,
			TotalAmount: req.TotalAmount,
		}).Execute(&ign)
	}

	return c.JSON(fiber.Map{"success": true})
}

// GetAbandonedCarts returns all abandoned carts for admin
func GetAbandonedCarts(c *fiber.Ctx) error {
	var carts []abandonedCartDB
	err := config.Supabase.DB.From("abandoned_carts").Select("*").Execute(&carts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Failed to fetch carts"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    carts, // Admin dashboard will read this structure
	})
}

// GetUserCart returns the saved cart for a specific user
func GetUserCart(c *fiber.Ctx) error {
	userId := c.Query("userId")
	if userId == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Kullanıcı ID gerekli"})
	}

	var carts []abandonedCartDB
	err := config.Supabase.DB.From("abandoned_carts").Select("*").Eq("user_id", userId).Execute(&carts)
	if err != nil || len(carts) == 0 {
		return c.JSON(fiber.Map{"success": true, "data": nil}) // No saved cart
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    carts[0],
	})
}
