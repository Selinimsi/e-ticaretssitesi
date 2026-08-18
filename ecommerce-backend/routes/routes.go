package routes

import (
	"ecommerce-backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/products", controllers.GetProducts)
	api.Post("/checkout", controllers.Checkout)
	
	api.Get("/orders", controllers.GetUserOrders)
	api.Post("/orders", controllers.CreateOrder)
	
	api.Post("/payment/callback", controllers.PaymentCallback)
}
