package models

import "strings"

type Product struct {
	ID            string  `json:"id"`
	NameTR        string  `json:"nameTr"`
	NameEN        string  `json:"nameEn"`
	DescriptionTR string  `json:"descriptionTr"`
	DescriptionEN string  `json:"descriptionEn"`
	Price         float64 `json:"price"`
	ImageURL      string  `json:"imageUrl"`
	Category      string  `json:"category"`
	SubCategory   string  `json:"subCategory"`
	Stock         int     `json:"stock"`
	SellerID      string  `json:"sellerId"`
	IsActive      bool    `json:"isActive"`
}

var MockProducts = []Product{
	{
		ID:            "prod_1",
		NameTR:        "Premium Kablosuz Kulaklık",
		NameEN:        "Premium Wireless Headphones",
		DescriptionTR: "Yüksek kaliteli gürültü önleyici kablosuz kulaklık.",
		DescriptionEN: "High-quality noise-canceling wireless headphones.",
		Price:         1299.99,
		ImageURL:      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800",
		Category:      "Elektronik",
		SellerID:      "seller_1",
		IsActive:      true,
	},
	{
		ID:            "prod_2",
		NameTR:        "Mekanik Klavye",
		NameEN:        "Mechanical Keyboard",
		DescriptionTR: "RGB aydınlatmalı mekanik klavye.",
		DescriptionEN: "RGB mechanical keyboard with tactile switches.",
		Price:         850.50,
		ImageURL:      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800",
		Category:      "Elektronik",
		SellerID:      "seller_1",
		IsActive:      true,
	},
	{
		ID:            "prod_3",
		NameTR:        "Ergonomik Mouse",
		NameEN:        "Ergonomic Mouse",
		DescriptionTR: "Uzun çalışma saatleri için kablosuz ergonomik fare.",
		DescriptionEN: "Wireless ergonomic mouse for long working hours.",
		Price:         450.00,
		ImageURL:      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800",
		Category:      "Elektronik",
		SellerID:      "seller_1",
		IsActive:      true,
	},
	{
		ID:            "prod_4",
		NameTR:        "4K Monitör 27-inç",
		NameEN:        "4K Monitor 27-inch",
		DescriptionTR: "Mükemmel renklere sahip Ultra HD IPS monitör.",
		DescriptionEN: "Ultra HD IPS monitor with brilliant colors.",
		Price:         4999.00,
		ImageURL:      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800",
		Category:      "Elektronik",
		SellerID:      "seller_1",
		IsActive:      true,
	},
	{
		ID:            "prod_5",
		NameTR:        "Oversize Hoodie",
		NameEN:        "Oversized Hoodie",
		DescriptionTR: "Rahat pamuklu oversize kapüşonlu sweatshirt.",
		DescriptionEN: "Comfortable cotton oversized hoodie.",
		Price:         600.00,
		ImageURL:      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800",
		Category:      "Giyim",
		SellerID:      "seller_1",
		IsActive:      true,
	},
	{
		ID:            "prod_6",
		NameTR:        "Koşu Ayakkabısı",
		NameEN:        "Running Sneakers",
		DescriptionTR: "Günlük antrenmanlar için hafif koşu ayakkabısı.",
		DescriptionEN: "Lightweight running shoes for everyday training.",
		Price:         1500.00,
		ImageURL:      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800",
		Category:      "Giyim",
		SellerID:      "seller_1",
		IsActive:      true,
	},
	{
		ID:            "prod_7",
		NameTR:        "Akıllı Saat",
		NameEN:        "Smart Watch",
		DescriptionTR: "Kalp atış hızı monitörlü akıllı saat.",
		DescriptionEN: "Fitness tracking smart watch with heart rate monitor.",
		Price:         2200.00,
		ImageURL:      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800",
		Category:      "Aksesuar",
		SellerID:      "seller_1",
		IsActive:      true,
	},
	{
		ID:            "prod_8",
		NameTR:        "Deri Sırt Çantası",
		NameEN:        "Leather Backpack",
		DescriptionTR: "Günlük kullanım ve laptop için premium deri çanta.",
		DescriptionEN: "Premium leather backpack for laptops and daily use.",
		Price:         900.00,
		ImageURL:      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800",
		Category:      "Aksesuar",
		SellerID:      "seller_1",
		IsActive:      true,
	},
}

// Helper to filter products
func GetFilteredProducts(category string, subCategory string, search string, activeOnly bool) []Product {
	var filtered []Product
	for _, p := range MockProducts {
		if activeOnly && !p.IsActive {
			continue
		}
		matchCategory := category == "" || category == "Tümü" || p.Category == category
		matchSubCategory := subCategory == "" || p.SubCategory == subCategory
		
		searchLower := strings.ToLower(search)
		matchSearch := search == "" || 
			strings.Contains(strings.ToLower(p.NameTR), searchLower) || 
			strings.Contains(strings.ToLower(p.NameEN), searchLower)
			
		if matchCategory && matchSubCategory && matchSearch {
			filtered = append(filtered, p)
		}
	}
	return filtered
}
