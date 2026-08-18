package models

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"` // "user" or "admin"
}

var MockUsers = []User{
	{
		ID:       "user_admin",
		Email:    "admin@varunet.com",
		Password: "password123",
		Name:     "Admin User",
		Role:     "admin",
	},
	{
		ID:       "user_test",
		Email:    "test@user.com",
		Password: "password123",
		Name:     "Test User",
		Role:     "customer",
	},
	{
		ID:       "seller_1",
		Email:    "seller@varunet.com",
		Password: "password123",
		Name:     "Ahmet Satıcı",
		Role:     "seller",
	},
	{
		ID:       "support_1",
		Email:    "support@varunet.com",
		Password: "password123",
		Name:     "Destek Ekibi",
		Role:     "support",
	},
}
