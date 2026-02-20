package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	// connect to db
	dsn := "postgres://ramin:@localhost:5432/hotel_story?sslmode=disable"
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	queries := []string{
		"ALTER TABLE story_slides ADD COLUMN IF NOT EXISTS duration INT DEFAULT 7;",
		"ALTER TABLE story_slides ADD COLUMN IF NOT EXISTS background_color VARCHAR(50);",
		"ALTER TABLE story_slides ALTER COLUMN image_url DROP NOT NULL;",
	}

	for _, q := range queries {
		_, err := db.Exec(q)
		if err != nil {
			log.Printf("Error executing query '%s': %v", q, err)
		} else {
			fmt.Printf("Successfully executed: %s\n", q)
		}
	}
}
