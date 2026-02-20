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

// --- Stats ---

func GetDashboardStats(c *gin.Context) {
	var stats models.DashboardStats

	// Total Groups
	err := database.DB.Get(&stats.TotalGroups, "SELECT COUNT(*) FROM story_groups")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total groups count"})
		return
	}

	// Active Groups
	err = database.DB.Get(&stats.ActiveGroups, "SELECT COUNT(*) FROM story_groups WHERE active = TRUE")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch active groups count"})
		return
	}

	// Total Slides
	err = database.DB.Get(&stats.TotalSlides, "SELECT COUNT(*) FROM story_slides")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total slides count"})
		return
	}

	// Total Views (Group views + Slide opens)
	var groupViews, slideOpens int
	database.DB.Get(&groupViews, "SELECT COALESCE(SUM(view_count), 0) FROM story_groups")
	database.DB.Get(&slideOpens, "SELECT COALESCE(SUM(open_count), 0) FROM story_slides")
	stats.TotalViews = groupViews + slideOpens

	// Total Cities
	err = database.DB.Get(&stats.TotalCities, "SELECT COUNT(DISTINCT city_slug) FROM story_groups WHERE active = TRUE")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cities count"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// --- Groups ---

func GetGroups(c *gin.Context) {
	groups := []models.StoryGroup{}
	query := `
		SELECT 
			g.id, g.city_slug, g.title_fa, g.caption, g.cover_url, g.short_code, g.active, g.view_count, g.created_at,
			COUNT(s.id) as story_count
		FROM story_groups g
		LEFT JOIN story_slides s ON s.group_id = g.id
		GROUP BY g.id, g.city_slug, g.title_fa, g.caption, g.cover_url, g.short_code, g.active, g.view_count, g.created_at
		ORDER BY g.created_at DESC`

	err := database.DB.Select(&groups, query)
	if err != nil {
		fmt.Printf("DEBUG: GetGroups DB Error: %v\n", err)
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

	if input.CoverURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cover image is mandatory"})
		return
	}

	// Generate short_code if not provided (simple logic for MVP)
	if input.ShortCode == "" {
		input.ShortCode = fmt.Sprintf("%s-%d", input.CitySlug, time.Now().Unix())
	}

	query := `INSERT INTO story_groups (city_slug, title_fa, caption, cover_url, short_code, active) 
              VALUES (:city_slug, :title_fa, :caption, :cover_url, :short_code, :active) RETURNING id`

	rows, err := database.DB.NamedQuery(query, input)
	if err != nil {
		fmt.Printf("DEBUG: CreateGroup DB Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create group"})
		return
	}
	defer rows.Close()

	if rows.Next() {
		rows.Scan(&input.ID)
	}

	c.JSON(http.StatusCreated, input)
}

func UpdateGroup(c *gin.Context) {
	id := c.Param("id")
	var input models.StoryGroup
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.CoverURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cover image is mandatory"})
		return
	}

	query := `UPDATE story_groups SET 
				city_slug = $1, 
				title_fa = $2, 
				caption = $3, 
				cover_url = $4, 
				active = $5 
			  WHERE id = $6`

	_, err := database.DB.Exec(query, input.CitySlug, input.TitleFa, input.Caption, input.CoverURL, input.Active, id)
	if err != nil {
		fmt.Printf("DEBUG: UpdateGroup DB Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update group"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func UploadImage(c *gin.Context) {
	fmt.Println("DEBUG: UploadImage handler hit")
	file, err := c.FormFile("image")
	if err != nil {
		fmt.Printf("DEBUG: UploadImage FormFile error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image provided"})
		return
	}

	// 2MB Limit
	const maxSize = 2 * 1024 * 1024
	if file.Size > maxSize {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "File size exceeds 2MB limit"})
		return
	}

	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, 0755)
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
	dst := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		fmt.Printf("DEBUG: UploadImage Save Error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": "/uploads/" + filename})
}

// --- Slides ---

func AddSlide(c *gin.Context) {
	groupID := c.Param("id")
	caption := c.PostForm("caption_fa")
	durationStr := c.PostForm("duration")
	bgColor := c.PostForm("background_color")

	// Duration (default 7)
	duration := 7
	if durationStr != "" {
		fmt.Sscanf(durationStr, "%d", &duration)
	}

	// Image Upload (Partial Optional if bgColor is set)
	var imageURL string
	file, err := c.FormFile("image")
	if err == nil {
		// Valid image file provided
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
		imageURL = "/uploads/" + filename
	} else if bgColor == "" {
		// No image AND no background color -> Error
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file OR background color is required"})
		return
	}

	elements := c.PostForm("elements")
	// fmt.Println("DEBUG ELEMENTS:", elements)
	if elements == "" {
		elements = "[]"
	}

	slide := models.StorySlide{
		GroupID:   0, // set below
		ImageURL:  imageURL,
		CaptionFa: caption,
		Elements:  json.RawMessage(elements),
		Duration:  duration,
	}
	if bgColor != "" {
		slide.BackgroundColor = &bgColor
	}
	// Parse groupID to int
	fmt.Sscanf(groupID, "%d", &slide.GroupID)

	query := `INSERT INTO story_slides (group_id, image_url, caption_fa, elements, duration, background_color) 
              VALUES (:group_id, :image_url, :caption_fa, :elements, :duration, :background_color) RETURNING id`

	rows, err := database.DB.NamedQuery(query, slide)
	if err != nil {
		fmt.Println("DB Insert Error:", err)
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

	// Debug log
	fmt.Printf("DEBUG: Found %d groups for city: %s\n", len(groups), citySlug)

	validGroups := []models.StoryGroup{}
	for i := range groups {
		slides := []models.StorySlide{} // Initialize as empty slice
		err := database.DB.Select(&slides, "SELECT * FROM story_slides WHERE group_id = $1 ORDER BY sort_order ASC", groups[i].ID)
		if err != nil {
			fmt.Println("DEBUG: Error fetching slides:", err)
		}
		groups[i].Slides = slides

		fmt.Printf("DEBUG: Group ID %d has %d slides\n", groups[i].ID, len(slides))

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

func DeleteGroup(c *gin.Context) {
	id := c.Param("id")

	// Check if group is active
	var isActive bool
	err := database.DB.Get(&isActive, "SELECT active FROM story_groups WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check group status"})
		return
	}

	if isActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete an active story group. Please deactivate it first."})
		return
	}

	// Start a transaction to ensure both group and slides are deleted
	tx, err := database.DB.Beginx()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// 1. Delete associated slides
	_, err = tx.Exec("DELETE FROM story_slides WHERE group_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete slides"})
		return
	}

	// 2. Delete the group
	_, err = tx.Exec("DELETE FROM story_groups WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete group"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.Status(http.StatusOK)
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

	// Check if slide exists and get current image
	var currentSlide models.StorySlide
	err := database.DB.Get(&currentSlide, "SELECT * FROM story_slides WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Slide not found"})
		return
	}

	caption := c.PostForm("caption_fa")
	durationStr := c.PostForm("duration")
	bgColor := c.PostForm("background_color")
	elements := c.PostForm("elements")
	sortOrderStr := c.PostForm("sort_order")

	// Duration
	duration := currentSlide.Duration
	if durationStr != "" {
		fmt.Sscanf(durationStr, "%d", &duration)
	}

	// Sort Order
	sortOrder := currentSlide.SortOrder
	if sortOrderStr != "" {
		fmt.Sscanf(sortOrderStr, "%d", &sortOrder)
	}

	// Image Upload
	imageURL := currentSlide.ImageURL
	file, err := c.FormFile("image")
	if err == nil {
		uploadDir := "./uploads"
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
		dst := filepath.Join(uploadDir, filename)
		if err := c.SaveUploadedFile(file, dst); err == nil {
			imageURL = "/uploads/" + filename
			// Optional: delete old image file (best practice)
		}
	}

	if elements == "" {
		elements = string(currentSlide.Elements)
	}

	finalBgColor := bgColor
	if finalBgColor == "" && currentSlide.BackgroundColor != nil {
		finalBgColor = *currentSlide.BackgroundColor
	}

	query := `UPDATE story_slides SET 
				image_url = $1, 
				caption_fa = $2, 
				elements = $3, 
				duration = $4, 
				background_color = $5,
				sort_order = $6
			  WHERE id = $7`

	_, err = database.DB.Exec(query, imageURL, caption, elements, duration, finalBgColor, sortOrder, id)
	if err != nil {
		fmt.Println("DB Update Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update slide"})
		return
	}

	c.Status(http.StatusOK)
}
