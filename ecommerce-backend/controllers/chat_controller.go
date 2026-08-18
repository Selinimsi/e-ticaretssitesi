package controllers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"sort"
	"sync"
	"time"

	"ecommerce-backend/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// In a real app, this key should be in .env and strictly protected (must be 32 bytes for AES-256)
var encryptionKey = []byte("super-secret-key-32-bytes-long!!")

// Encrypt messages before storing in DB so 3rd parties can't read them
func encryptMessage(text string) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}
	ciphertext := make([]byte, aes.BlockSize+len(text))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}
	cfb := cipher.NewCFBEncrypter(block, iv)
	cfb.XORKeyStream(ciphertext[aes.BlockSize:], []byte(text))
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt messages when sending back to authorized users
func decryptMessage(cryptoText string) (string, error) {
	ciphertext, _ := base64.StdEncoding.DecodeString(cryptoText)
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}
	if len(ciphertext) < aes.BlockSize {
		return "", fmt.Errorf("ciphertext too short")
	}
	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]
	cfb := cipher.NewCFBDecrypter(block, iv)
	cfb.XORKeyStream(ciphertext, ciphertext)
	return string(ciphertext), nil
}

// Client Manager for WebSockets
type Client struct {
	Conn *websocket.Conn
	Role string // customer, seller, support
	ID   string
}

var clients = make(map[*Client]bool)
var broadcast = make(chan []byte)
var mutex = sync.Mutex{}

// Mock DB for Encrypted Messages
type ChatMessage struct {
	ID        string    `json:"id"`
	SenderID  string    `json:"senderId"`
	Role      string    `json:"role"`
	Text      string    `json:"text"` // Will hold encrypted text in DB
	CreatedAt time.Time `json:"createdAt"`
}

// DB struct for ChatMessage
type chatMessageDB struct {
	ID         string    `json:"id,omitempty"`
	RoomID     string    `json:"room_id"`
	SenderRole string    `json:"sender_role"`
	SenderName string    `json:"sender_name"`
	Text       string    `json:"text"`
	CreatedAt  time.Time `json:"created_at,omitempty"`
}

var messageHistory []ChatMessage // We can keep a local cache, but let's just fetch from DB

func HandleWebSocket() func(*websocket.Conn) {
	return func(c *websocket.Conn) {
		role := c.Query("role")
		id := c.Query("id")
		roomId := "general" // Default room, can be dynamic based on user

		client := &Client{Conn: c, Role: role, ID: id}
		mutex.Lock()
		clients[client] = true
		mutex.Unlock()

		// Fetch history from DB
		var dbMessages []chatMessageDB
		err := config.Supabase.DB.From("chat_messages").Select("*").Execute(&dbMessages)
		if err == nil {
			// Sort the messages manually by CreatedAt since postgrest-go SelectRequestBuilder might not have Order
			sort.Slice(dbMessages, func(i, j int) bool {
				return dbMessages[i].CreatedAt.Before(dbMessages[j].CreatedAt)
			})
			for _, dbMsg := range dbMessages {
				decryptedText, _ := decryptMessage(dbMsg.Text)
				wsMsg := ChatMessage{
					ID:        dbMsg.ID,
					SenderID:  dbMsg.SenderName, // Using name for senderId to keep it simple with existing UI
					Role:      dbMsg.SenderRole,
					Text:      decryptedText,
					CreatedAt: dbMsg.CreatedAt,
				}
				msgBytes, _ := json.Marshal(wsMsg)
				c.WriteMessage(websocket.TextMessage, msgBytes)
			}
		}

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				mutex.Lock()
				delete(clients, client)
				mutex.Unlock()
				c.Close()
				break
			}

			var incomingMsg struct {
				Text string `json:"text"`
			}
			json.Unmarshal(msg, &incomingMsg)

			encryptedText, err := encryptMessage(incomingMsg.Text)
			if err != nil {
				log.Println("Encryption error:", err)
				continue
			}

			// Save to DB
			dbMsg := chatMessageDB{
				RoomID:     roomId,
				SenderRole: client.Role,
				SenderName: client.ID,
				Text:       encryptedText,
			}
			
			var result []chatMessageDB
			_ = config.Supabase.DB.From("chat_messages").Insert(dbMsg).Execute(&result)

			msgId := fmt.Sprintf("msg_%d", time.Now().UnixNano())
			if len(result) > 0 {
				msgId = result[0].ID
			}

			chatMsg := ChatMessage{
				ID:        msgId,
				SenderID:  client.ID,
				Role:      client.Role,
				Text:      incomingMsg.Text, // Broadcast unencrypted
				CreatedAt: time.Now(),
			}

			msgBytes, _ := json.Marshal(chatMsg)
			broadcast <- msgBytes
		}
	}
}

func BroadcastMessages() {
	for {
		msg := <-broadcast
		mutex.Lock()
		for client := range clients {
			err := client.Conn.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				client.Conn.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}

type ContactMessageRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

// HTTP Endpoint for Contact form
func ReceiveContactMessage(c *fiber.Ctx) error {
	var req ContactMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "error": "Invalid request"})
	}

	formattedMsg := fmt.Sprintf("[İLETİŞİM FORMU] %s (%s): %s", req.Name, req.Email, req.Message)

	encryptedText, err := encryptMessage(formattedMsg)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "error": "Encryption failed"})
	}

	chatMsg := ChatMessage{
		ID:        fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		SenderID:  "system_contact",
		Role:      "customer",
		Text:      formattedMsg, // Unencrypted for broadcast
		CreatedAt: time.Now(),
	}

	// Insert into DB
	var ign []chatMessageDB
	_ = config.Supabase.DB.From("chat_messages").Insert(chatMessageDB{
		RoomID:     "general",
		SenderRole: "customer",
		SenderName: "system_contact",
		Text:       encryptedText,
	}).Execute(&ign)

	// Broadcast
	wsMsg := chatMsg
	wsMsg.Text = formattedMsg
	msgBytes, _ := json.Marshal(wsMsg)
	
	// Send non-blocking or in goroutine
	go func() {
		broadcast <- msgBytes
	}()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Contact message received and sent to support dashboard",
	})
}
