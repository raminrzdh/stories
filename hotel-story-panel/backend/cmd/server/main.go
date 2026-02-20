package main

import (
	"log"

	"hotel-story-panel/backend/internal/database"
	"hotel-story-panel/backend/internal/handlers"
	"hotel-story-panel/backend/internal/middleware"

	"github.com/gin-gonic/gin"
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
			public.POST("/stories/group-open/:id", handlers.IncrementGroupOpen)
		}

		// Protected (Admin)
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware())
		{
			admin.GET("/stats", handlers.GetDashboardStats)
			admin.GET("/story-groups", handlers.GetGroups)
			admin.GET("/story-groups/:id", handlers.GetGroup)
			admin.POST("/story-groups", handlers.CreateGroup)
			admin.PUT("/story-groups/:id", handlers.UpdateGroup)
			admin.DELETE("/story-groups/:id", handlers.DeleteGroup)
			admin.POST("/story-groups/:id/stories", handlers.AddSlide)
			admin.PATCH("/story-groups/:id/status", handlers.ToggleGroupStatus)
			admin.DELETE("/stories/:id", handlers.DeleteSlide)
			admin.PUT("/stories/:id", handlers.UpdateSlide)
			admin.POST("/upload", handlers.UploadImage)
		}
	}

	log.Println("Server running on :8080")
	r.Run(":8080")
}
