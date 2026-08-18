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

func setupAuthApp() *fiber.App {
	app := fiber.New()
	
	models.MockUsers = []models.User{
		{
			ID:       "user_test_1",
			Name:     "Test User",
			Email:    "test@user.com",
			Password: "password123",
			Role:     "customer",
		},
	}

	app.Post("/api/login", Login)
	return app
}

func TestLoginSuccess(t *testing.T) {
	app := setupAuthApp()

	payload := map[string]string{
		"email":    "test@user.com",
		"password": "password123",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/api/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.True(t, result["success"].(bool))
	assert.NotEmpty(t, result["token"])
	
	user := result["user"].(map[string]interface{})
	assert.Equal(t, "test@user.com", user["email"])
	assert.Empty(t, user["password"]) // Password should not be returned
}

func TestLoginFailure(t *testing.T) {
	app := setupAuthApp()

	payload := map[string]string{
		"email":    "test@user.com",
		"password": "wrongpassword",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/api/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 401, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.False(t, result["success"].(bool))
	assert.Equal(t, "Invalid credentials", result["error"])
}
