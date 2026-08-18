package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	supabase "github.com/nedpals/supabase-go"
)

var Supabase *supabase.Client

func InitSupabase() {
	// Try loading .env file, ignore if not found (e.g. in production)
	_ = godotenv.Load()

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment")
	}

	Supabase = supabase.CreateClient(supabaseURL, supabaseKey)
	log.Println("Supabase client initialized via REST API")
}
