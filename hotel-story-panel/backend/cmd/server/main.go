package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"hotel-story-panel/backend/internal/database"
	"hotel-story-panel/backend/internal/handlers"
	"hotel-story-panel/backend/internal/middleware"
)

func main() {
	// Initialize Database
	database.InitDB()
	defer database.CloseDB()

	r := gin.Default()

	// CORS Setup (Allowing All for MVP)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Static Files (Uploads)
	r.Static("/uploads", "./uploads")

	// Routes
	api := r.Group("/api")
	{
		// Auth
		auth := api.Group("/auth")
		{
			auth.POST("/signup", handlers.Signup)
			auth.POST("/login", handlers.Login)
		}

		// Public
		public := api.Group("/public")
		{
			public.GET("/stories/:city_slug", handlers.GetPublicStories)
			public.POST("/stories/open/:id", handlers.IncrementSlideOpen)
		}

		// Protected (Admin)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/groups", handlers.GetGroups)
			protected.GET("/groups/:id", handlers.GetGroup)
			protected.POST("/groups", handlers.CreateGroup)
			protected.POST("/groups/:id/slides", handlers.AddSlide)
			protected.PATCH("/groups/:id/status", handlers.ToggleGroupStatus)
			protected.DELETE("/slides/:id", handlers.DeleteSlide)
			protected.PUT("/slides/:id", handlers.UpdateSlide)
		}
	}

	log.Println("Server running on :8080")
	r.Run(":8080")
}
