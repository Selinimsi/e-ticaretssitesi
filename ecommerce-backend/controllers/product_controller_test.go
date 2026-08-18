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

func setupTestApp() *fiber.App {
	app := fiber.New()
	
	// Reset MockProducts before each test for predictable results
	models.MockProducts = []models.Product{
		{
			ID:          "prod_test_1",
			NameTR:      "Test Ürün",
			NameEN:      "Test Product",
			Price:       100.0,
			Category:    "Test",
			SubCategory: "SubTest",
			IsActive:    true,
			SellerID:    "seller_1",
		},
		{
			ID:          "prod_test_2",
			NameTR:      "İnaktif Ürün",
			NameEN:      "Inactive Product",
			Price:       50.0,
			Category:    "Test",
			SubCategory: "SubTest2",
			IsActive:    false,
			SellerID:    "seller_2",
		},
	}

	app.Get("/api/products", GetProducts)
	app.Post("/api/products", CreateProduct)
	app.Put("/api/products/:id", UpdateProduct)
	app.Delete("/api/products/:id", DeleteProduct)

	return app
}

func TestGetProducts(t *testing.T) {
	app := setupTestApp()

	// 1. Get all active products
	req := httptest.NewRequest("GET", "/api/products", nil)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.True(t, result["success"].(bool))
	
	data := result["data"].([]interface{})
	assert.Equal(t, 1, len(data)) // Only active product should be returned
	assert.Equal(t, "prod_test_1", data[0].(map[string]interface{})["id"])

	// 2. Get all products including inactive
	reqAll := httptest.NewRequest("GET", "/api/products?all=true", nil)
	respAll, _ := app.Test(reqAll, -1)
	
	var resultAll map[string]interface{}
	json.NewDecoder(respAll.Body).Decode(&resultAll)
	
	dataAll := resultAll["data"].([]interface{})
	assert.Equal(t, 2, len(dataAll))
}

func TestCreateProduct(t *testing.T) {
	app := setupTestApp()

	newProd := models.Product{
		NameTR: "Yeni Ürün",
		NameEN: "New Product",
		Price:  150.0,
	}
	body, _ := json.Marshal(newProd)

	req := httptest.NewRequest("POST", "/api/products", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.True(t, result["success"].(bool))
	data := result["data"].(map[string]interface{})
	assert.Equal(t, "Yeni Ürün", data["nameTr"])
	assert.NotEmpty(t, data["id"])
}

func TestDeleteProduct(t *testing.T) {
	app := setupTestApp()

	req := httptest.NewRequest("DELETE", "/api/products/prod_test_1", nil)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.True(t, result["success"].(bool))

	// Verify deletion
	reqVerify := httptest.NewRequest("GET", "/api/products?all=true", nil)
	respVerify, _ := app.Test(reqVerify, -1)
	
	var resultVerify map[string]interface{}
	json.NewDecoder(respVerify.Body).Decode(&resultVerify)
	dataVerify := resultVerify["data"].([]interface{})
	assert.Equal(t, 1, len(dataVerify)) // Only one product should be left
	assert.Equal(t, "prod_test_2", dataVerify[0].(map[string]interface{})["id"])
}
