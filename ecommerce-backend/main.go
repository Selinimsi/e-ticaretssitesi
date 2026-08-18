package main

import (
	"ecommerce-backend/config"
	"ecommerce-backend/controllers"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

func main() {
	// Initialize Database / Configs
	config.InitSupabase()

	app := fiber.New()

	// CORS Middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// API Routes
	api := app.Group("/api")

	// Products
	api.Get("/products", controllers.GetProducts)
	api.Post("/products", controllers.CreateProduct)
	api.Put("/products/:id", controllers.UpdateProduct)
	api.Delete("/products/:id", controllers.DeleteProduct)

	// File Upload
	api.Post("/upload", controllers.UploadImage)

	// Checkout
	api.Post("/checkout", controllers.Checkout)
	api.Post("/payment/callback", controllers.PaymentCallback)

	// Auth
	api.Post("/login", controllers.Login)
	api.Post("/register", controllers.Register)

	// Orders
	api.Get("/orders", controllers.GetUserOrders)
	api.Post("/orders", controllers.CreateOrder)

	// Support
	api.Post("/support/message", controllers.ReceiveContactMessage)

	// Marketing
	api.Get("/marketing/flash-sales", controllers.GetFlashSales)
	api.Post("/marketing/coupons/validate", controllers.ValidateCoupon)
	api.Post("/marketing/abandoned-carts", controllers.AbandonCart)
	api.Get("/marketing/admin/abandoned-carts", controllers.GetAbandonedCarts)
	api.Get("/marketing/user-cart", controllers.GetUserCart)

	// WebSocket Middleware & Route
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	go controllers.BroadcastMessages()
	app.Get("/ws/chat", websocket.New(controllers.HandleWebSocket()))

	// Start Go Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}
	log.Fatal(app.Listen(":" + port))
}
