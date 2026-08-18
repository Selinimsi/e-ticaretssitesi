package controllers

import (
	"ecommerce-backend/config"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("varunet-super-secret-key")

type userDB struct {
	ID       string `json:"id,omitempty"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

func Login(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return err
	}

	var allUsers []userDB
	err := config.Supabase.DB.From("users").Select("*").Execute(&allUsers)
	
	var user *userDB
	for i, u := range allUsers {
		if u.Email == data["email"] {
			user = &allUsers[i]
			break
		}
	}

	if err != nil || user == nil {
		errMsg := "Invalid credentials"
		if err != nil {
			errMsg = err.Error()
			fmt.Println("Login DB Error:", errMsg)
		}
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   errMsg,
		})
	}

	// Check password (In production, use bcrypt)
	if user.Password == data["password"] {
		// Create token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"id":    user.ID,
			"role":  user.Role,
			"email": user.Email,
			"exp":   time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, err := token.SignedString(secretKey)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not login"})
		}

		// Don't send password back
		user.Password = ""

		return c.JSON(fiber.Map{
			"success": true,
			"token":   tokenString,
			"user":    user,
		})
	}

	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"success": false,
		"error":   "Invalid credentials",
	})
}

func Register(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return err
	}

	name := data["name"]
	email := data["email"]
	password := data["password"]

	if name == "" || email == "" || password == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "All fields are required"})
	}

	newUser := userDB{
		Name:     name,
		Email:    email,
		Password: password, // In production, hash this!
		Role:     "customer", // Default role
	}

	var results []userDB
	err := config.Supabase.DB.From("users").Insert(newUser).Execute(&results)
	if err != nil || len(results) == 0 {
		if err != nil {
			fmt.Println("DB Insert Error:", err.Error())
		}
		// Possibly email already exists
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Email already exists or invalid", "details": err.Error()})
	}

	user := results[0]
	user.Password = "" // omit password

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    user.ID,
		"role":  user.Role,
		"email": user.Email,
		"exp":   time.Now().Add(time.Hour*24).Unix(),
	})

	tokenString, _ := token.SignedString(secretKey)

	return c.JSON(fiber.Map{
		"success": true,
		"token":   tokenString,
		"user":    user,
	})
}
