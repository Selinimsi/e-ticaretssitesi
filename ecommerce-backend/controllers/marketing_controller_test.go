package controllers

import (
	"bytes"
	"ecommerce-backend/models"
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func setupMarketingApp() *fiber.App {
	app := fiber.New()
	
	models.MockCoupons = []models.Coupon{
		{Code: "DISCOUNT10", Type: "percentage", Value: 10, MinCartValue: 100, IsActive: true, ExpiryDate: time.Now().Add(24 * time.Hour)},
		{Code: "EXPIRED", Type: "fixed", Value: 20, MinCartValue: 50, IsActive: true, ExpiryDate: time.Now().Add(-24 * time.Hour)},
	}

	app.Post("/api/marketing/coupons/validate", ValidateCoupon)
	return app
}

func TestValidateCoupon_Success(t *testing.T) {
	app := setupMarketingApp()

	payload := map[string]interface{}{
		"code":      "DISCOUNT10",
		"cartTotal": 150.0,
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/api/marketing/coupons/validate", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.True(t, result["success"].(bool))
	data := result["data"].(map[string]interface{})
	assert.Equal(t, "DISCOUNT10", data["code"])
}

func TestValidateCoupon_Expired(t *testing.T) {
	app := setupMarketingApp()

	payload := map[string]interface{}{
		"code":      "EXPIRED",
		"cartTotal": 150.0,
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/api/marketing/coupons/validate", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 400, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.False(t, result["success"].(bool))
	assert.Contains(t, result["message"].(string), "süresi dolmuş")
}

func TestValidateCoupon_InsufficientCartTotal(t *testing.T) {
	app := setupMarketingApp()

	payload := map[string]interface{}{
		"code":      "DISCOUNT10",
		"cartTotal": 50.0, // Min cart value is 100
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/api/marketing/coupons/validate", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 400, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.False(t, result["success"].(bool))
	assert.Contains(t, result["message"].(string), "yetersiz")
}
