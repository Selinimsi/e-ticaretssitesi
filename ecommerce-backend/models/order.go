package models

import "time"

type OrderItem struct {
	ProductID string  `json:"productId"`
	NameTR    string  `json:"nameTr"`
	NameEN    string  `json:"nameEn"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	SellerID  string  `json:"sellerId"`
}

type Order struct {
	ID            string      `json:"id"`
	UserID        string      `json:"userId"`
	Address       string      `json:"address"`
	PaymentMethod string      `json:"paymentMethod"`
	Items         []OrderItem `json:"items"`
	TotalAmount   float64     `json:"totalAmount"`
	Status        string      `json:"status"` // "pending", "completed", "failed"
	CreatedAt     time.Time   `json:"createdAt"`
}

var MockOrders = []Order{}
