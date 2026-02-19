package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"hotel-story-panel/backend/internal/database"
	"hotel-story-panel/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// --- Groups ---

func GetGroups(c *gin.Context) {
	groups := []models.StoryGroup{}
	err := database.DB.Select(&groups, "SELECT * FROM story_groups ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch groups"})
		return
	}
	c.JSON(http.StatusOK, groups)
}

func GetGroup(c *gin.Context) {
	id := c.Param("id")
	var group models.StoryGroup
	err := database.DB.Get(&group, "SELECT * FROM story_groups WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}

	var slides []models.StorySlide
	err = database.DB.Select(&slides, "SELECT * FROM story_slides WHERE group_id = $1 ORDER BY sort_order ASC", id)
	if err == nil {
		group.Slides = slides
	} else {
		group.Slides = []models.StorySlide{}
	}

	c.JSON(http.StatusOK, group)
}

func CreateGroup(c *gin.Context) {
	var input models.StoryGroup
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate short_code if not provided (simple logic for MVP)
	if input.ShortCode == "" {
		input.ShortCode = fmt.Sprintf("%s-%d", input.CitySlug, time.Now().Unix())
	}

	query := `INSERT INTO story_groups (city_slug, title_fa, short_code, active) 
              VALUES (:city_slug, :title_fa, :short_code, :active) RETURNING id`

	rows, err := database.DB.NamedQuery(query, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create group"})
		return
	}
	defer rows.Close()

	if rows.Next() {
		rows.Scan(&input.ID)
	}

	c.JSON(http.StatusCreated, input)
}

// --- Slides ---

func AddSlide(c *gin.Context) {
	groupID := c.Param("id")
	caption := c.PostForm("caption_fa")

	// Image Upload
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required"})
		return
	}

	// Ensure upload dir exists
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, 0755)
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
	dst := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// For MVP, serving static files directly. In prod, use S3/R2.
	imageURL := "/uploads/" + filename

	elements := c.PostForm("elements")
	fmt.Println("DEBUG ELEMENTS:", elements)
	if elements == "" {
		elements = "[]"
	}

	slide := models.StorySlide{
		GroupID:   0, // set below
		ImageURL:  imageURL,
		CaptionFa: caption,
		Elements:  json.RawMessage(elements),
	}
	// Parse groupID to int
	fmt.Sscanf(groupID, "%d", &slide.GroupID)

	query := `INSERT INTO story_slides (group_id, image_url, caption_fa, elements) 
              VALUES (:group_id, :image_url, :caption_fa, :elements) RETURNING id`

	rows, err := database.DB.NamedQuery(query, slide)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add slide"})
		return
	}
	defer rows.Close()

	if rows.Next() {
		rows.Scan(&slide.ID)
	}

	c.JSON(http.StatusCreated, slide)
}

// --- Public ---

func GetPublicStories(c *gin.Context) {
	citySlug := c.Param("city_slug")

	var groups []models.StoryGroup
	fmt.Println("DEBUG: GetPublicStories for city:", citySlug)
	err := database.DB.Select(&groups, "SELECT * FROM story_groups WHERE city_slug = $1 AND active = TRUE", citySlug)
	if err != nil {
		fmt.Println("DEBUG: DB Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	validGroups := []models.StoryGroup{}
	for i := range groups {
		slides := []models.StorySlide{} // Initialize as empty slice
		_ = database.DB.Select(&slides, "SELECT * FROM story_slides WHERE group_id = $1 ORDER BY sort_order ASC", groups[i].ID)
		groups[i].Slides = slides

		if len(slides) > 0 {
			validGroups = append(validGroups, groups[i])
		}
	}

	// Increment view count for the group (async/fire-and-forget for MVP)
	if len(validGroups) > 0 {
		go func() {
			for _, g := range validGroups {
				database.DB.Exec("UPDATE story_groups SET view_count = view_count + 1 WHERE id = $1", g.ID)
			}
		}()
	}

	c.JSON(http.StatusOK, validGroups)
}

func IncrementSlideOpen(c *gin.Context) {
	slideID := c.Param("id")
	// Async increment
	go func() {
		database.DB.Exec("UPDATE story_slides SET open_count = open_count + 1 WHERE id = $1", slideID)
	}()
	c.Status(http.StatusOK)
}

// --- Management ---

func ToggleGroupStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Active bool `json:"active"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := database.DB.Exec("UPDATE story_groups SET active = $1 WHERE id = $2", input.Active, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func DeleteSlide(c *gin.Context) {
	id := c.Param("id")

	// Optional: Delete image file from disk (skipped for MVP brevity, but recommended)
	// var imageUrl string
	// database.DB.Get(&imageUrl, "SELECT image_url FROM story_slides WHERE id = $1", id)
	// ... os.Remove ...

	_, err := database.DB.Exec("DELETE FROM story_slides WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete slide"})
		return
	}

	c.Status(http.StatusOK)
}

func UpdateSlide(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		CaptionFa string `json:"caption_fa"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := database.DB.Exec("UPDATE story_slides SET caption_fa = $1, sort_order = $2 WHERE id = $3", input.CaptionFa, input.SortOrder, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update slide"})
		return
	}

	c.Status(http.StatusOK)
}
