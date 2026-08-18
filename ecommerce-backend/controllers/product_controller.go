package controllers

import (
	"ecommerce-backend/config"
	"ecommerce-backend/models"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type productDB struct {
	ID            string  `json:"id,omitempty"`
	SellerID      string  `json:"seller_id"`
	NameTR        string  `json:"name_tr"`
	NameEN        string  `json:"name_en"`
	DescriptionTR string  `json:"description_tr"`
	DescriptionEN string  `json:"description_en"`
	Price         float64 `json:"price"`
	Stock         int     `json:"stock"`
	Category      string  `json:"category"`
	SubCategory   string  `json:"sub_category"`
	ImageURL      string  `json:"image_url"`
	IsActive      bool    `json:"is_active"`
}

func toProductModel(p productDB) models.Product {
	return models.Product{
		ID:            p.ID,
		NameTR:        p.NameTR,
		NameEN:        p.NameEN,
		DescriptionTR: p.DescriptionTR,
		DescriptionEN: p.DescriptionEN,
		Price:         p.Price,
		ImageURL:      p.ImageURL,
		Category:      p.Category,
		SubCategory:   p.SubCategory,
		Stock:         p.Stock,
		SellerID:      p.SellerID,
		IsActive:      p.IsActive,
	}
}

func fromProductModel(p models.Product) productDB {
	return productDB{
		ID:            p.ID,
		SellerID:      p.SellerID,
		NameTR:        p.NameTR,
		NameEN:        p.NameEN,
		DescriptionTR: p.DescriptionTR,
		DescriptionEN: p.DescriptionEN,
		Price:         p.Price,
		Stock:         p.Stock,
		Category:      p.Category,
		SubCategory:   p.SubCategory,
		ImageURL:      p.ImageURL,
		IsActive:      p.IsActive,
	}
}

func GetProducts(c *fiber.Ctx) error {
	category := c.Query("category", "")
	subCategory := c.Query("subCategory", "")
	search := strings.ToLower(c.Query("search", ""))
	sellerId := c.Query("sellerId", "")
	activeOnly := c.Query("all") != "true"
	var results []productDB
	err := config.Supabase.DB.From("products").Select("*").Execute(&results)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	var finalProducts []models.Product
	for _, p := range results {
		if sellerId != "" && p.SellerID != sellerId {
			continue
		}
		if activeOnly && !p.IsActive {
			continue
		}
		if category != "" && category != "Tümü" && p.Category != category {
			continue
		}
		if subCategory != "" && p.SubCategory != subCategory {
			continue
		}
		if search != "" {
			if !strings.Contains(strings.ToLower(p.NameTR), search) && !strings.Contains(strings.ToLower(p.NameEN), search) {
				continue
			}
		}
		finalProducts = append(finalProducts, toProductModel(p))
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    finalProducts,
	})
}

func CreateProduct(c *fiber.Ctx) error {
	var input models.Product
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Invalid input"})
	}
	
	dbInput := fromProductModel(input)
	// Remove ID so Supabase generates it
	dbInput.ID = ""

	var results []productDB
	err := config.Supabase.DB.From("products").Insert(dbInput).Execute(&results)
	if err != nil || len(results) == 0 {
		errMsg := "Failed to create product"
		if err != nil {
			errMsg = err.Error()
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": errMsg})
	}

	return c.JSON(fiber.Map{"success": true, "data": toProductModel(results[0])})
}

func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var input models.Product
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Invalid input"})
	}

	dbInput := fromProductModel(input)

	var results []productDB
	err := config.Supabase.DB.From("products").Update(dbInput).Eq("id", id).Execute(&results)
	if err != nil || len(results) == 0 {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Failed to update product"})
	}

	return c.JSON(fiber.Map{"success": true, "data": toProductModel(results[0])})
}

func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var results []productDB
	err := config.Supabase.DB.From("products").Delete().Eq("id", id).Execute(&results)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Failed to delete product"})
	}

	return c.JSON(fiber.Map{"success": true})
}

func UploadImage(c *fiber.Ctx) error {
	_, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "No file uploaded"})
	}

	// Mocking image upload until Supabase storage is fully implemented in frontend
	imageUrl := "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800"

	return c.JSON(fiber.Map{"success": true, "imageUrl": imageUrl})
}
