package models

import "time"

type Coupon struct {
	ID           string    `json:"id"`
	Code         string    `json:"code"`
	Type         string    `json:"type"` // "fixed", "percentage"
	Value        float64   `json:"value"` // 50 (TL) or 10 (%)
	MinCartValue float64   `json:"minCartValue"`
	ExpiryDate   time.Time `json:"expiryDate"`
	IsActive     bool      `json:"isActive"`
}

type FlashSale struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
	ProductIDs  []string  `json:"productIds"` // IDs of products included in the sale
	DiscountPct float64   `json:"discountPct"` // Percentage discount applied to these products
	IsActive    bool      `json:"isActive"`
}

type AbandonedCart struct {
	ID          string      `json:"id"`
	UserID      string      `json:"userId"`
	Items       []OrderItem `json:"items"`
	TotalAmount float64     `json:"totalAmount"`
	LastUpdated time.Time   `json:"lastUpdated"`
	IsRecovered bool        `json:"isRecovered"` // true if the user eventually bought it
}

var MockCoupons = []Coupon{
	{
		ID:           "1",
		Code:         "HOSGELDIN50",
		Type:         "fixed",
		Value:        50.0,
		MinCartValue: 200.0,
		ExpiryDate:   time.Now().AddDate(0, 1, 0),
		IsActive:     true,
	},
	{
		ID:           "2",
		Code:         "YUZDE10",
		Type:         "percentage",
		Value:        10.0,
		MinCartValue: 0.0,
		ExpiryDate:   time.Now().AddDate(0, 1, 0),
		IsActive:     true,
	},
}

var MockFlashSales = []FlashSale{
	{
		ID:          "1",
		Title:       "Hafta Sonu Fırsatı!",
		Description: "Seçili teknoloji ürünlerinde büyük indirim.",
		StartTime:   time.Now(),
		EndTime:     time.Now().Add(24 * time.Hour), // Ends in 24 hours
		ProductIDs:  []string{"1", "2"}, // Matching mock product IDs
		DiscountPct: 20.0,
		IsActive:    true,
	},
}

var MockAbandonedCarts = []AbandonedCart{}
