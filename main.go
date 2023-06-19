package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	Id             int
	Email          string
	Pseudo         string
	Username       string
	Password       string
	ProfilePicture string
	Bio            string
	NbFollower     string
	NbFollowing    string
}

type UserWithExtraData struct {
	User
	Pseudo string
}

type LikeUser struct {
	TweetId        int
	AuthorId       int
	Username       string
	Message        string
	Nblikes        int
	Nbcomments     int
	Pseudo         string
	ProfilePicture string
	Date           string
}

type UserData struct {
	Email          string
	Pseudo         string
	Username       string
	ProfilePicture string
	Bio            string
	NbFollower     int
	NbFollowing    int
}

type Login struct {
	Email    string
	Password string
}

type NewUser struct {
	Email          string
	Pseudo         string
	Password       string
	ProfilePicture string
}

type Tweet struct {
	TweetId      int    `json:"tweetId"`
	AuthorId     int    `json:"authorId"`
	AuthorName   string `json:"authorName"`
	IsATweet     int    `json:"isATweet"`
	Message      string `json:"message"`
	NbLikes      int    `json:"nbLikes"`
	Date         string `json:"date"`
	NbComments   int    `json:"nbComments"`
	IdTweetReply int    `json:"idTweetReply"`
}

type TweetWithExtraData struct {
	Tweet
	ExtraData map[string]interface{}
}

type NewTweet struct {
	IdAuthor   int
	NameAuthor string
	Message    string
}

type NewComment struct {
	IdAuthor   int
	NameAuthor string
	Message    string
	IdTweet    int
}

type NewTweetReply struct {
	IdAuthor     int
	NameAuthor   string
	Message      string
	IdTweetReply int
}

type LikeATweet struct {
	IdTweet  int
	IdAuthor int
}

type FollowAUser struct {
	IdAuthor       int
	IdUserToFollow int
}

type AllTweetFromUser struct {
	IdAuthor int
}

type isFollowingAUser struct {
	isFollow bool
}

type updateTweet struct {
	TweetId    int    `json:"tweetId"`
	NewMessage string `json:"newMessage"`
}

type updateProfile struct {
	UserId         int    `json:"AuthorId"`
	Pseudo         string `json:"Pseudo"`
	Bio            string `json:"Bio"`
	ProfilePicture string `json:"ProfilePicture"`
}

func createUser(userData NewUser) bool {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		return false
	}

	defer db.Close()

	createUserTable := `
		CREATE TABLE if not exists users (
			id integer not null primary key autoincrement,
			email text not null,
			pseudo text not null,
			username text not null,
			password text not null,
			profilePicture text not null,
			bio text not null,
			nbFollower int not null,
			nbFollowing int not null
		);
	`
	_, err = db.Exec(createUserTable)

	createFollowTable := `
		CREATE TABLE if not exists follow (
			IdAuthor int not null,
			IdUserToFollow int not null
		);
	`
	_, err = db.Exec(createFollowTable)

	if err != nil {
		return false
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userData.Password), bcrypt.DefaultCost)

	_, err = db.Exec(`INSERT INTO users(email, pseudo, username, password, profilePicture, bio, nbFollower, nbFollowing)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, userData.Email, userData.Pseudo, `@`+strings.ToLower(replaceSpecialChars(userData.Pseudo)), hashedPassword, userData.ProfilePicture, "Pas de bio.", 0, 0)

	if err != nil {
		return false
	} else {
		return true
	}
}

func replaceSpecialChars(input string) string {
	regex := regexp.MustCompile(`[^a-zA-Z0-9]+`)
	output := regex.ReplaceAllString(input, "_")
	output = strings.TrimSpace(output)
	return output
}

func createComment(tweetData NewTweetReply) {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	createUserTable := `
		CREATE TABLE if not exists allTweet (
			tweetId integer not null primary key autoincrement,
			authorId integer not null,
			authorName text not null,
			isATweet int not null,
			message text not null,
			nblikes int not null,
			date text not null,
			nbcomments int not null,
			idTweetReply int not null
		);
	`
	_, err = db.Exec(createUserTable)

	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`INSERT INTO allTweet(authorId, authorName, isATweet, message, nblikes, date, nbcomments, idTweetReply)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, tweetData.IdAuthor, tweetData.NameAuthor, false, tweetData.Message, 0, "2018-12-12", 0, tweetData.IdTweetReply)

	if err != nil {
		log.Fatal(err)
	}
}

func likeATweet(tweetData LikeATweet) bool {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
		return false
	}

	defer db.Close()

	createLikeTable := `
		CREATE TABLE if not exists likes (
			tweetId integer not null,
			authorId integer not null
		);
	`
	_, err = db.Exec(createLikeTable)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`INSERT INTO likes (tweetId, authorId) VALUES (?, ?);`, tweetData.IdTweet, tweetData.IdAuthor)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`UPDATE allTweet SET nblikes = nblikes + 1 WHERE tweetId = ?;`, tweetData.IdTweet)

	if err != nil {
		log.Fatal(err)
		return false
	}

	return true
}

func dilikeATweet(tweetData LikeATweet) bool {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
		return false
	}

	defer db.Close()

	createLikeTable := `
		CREATE TABLE if not exists likes (
			tweetId integer not null,
			authorId integer not null
		);
	`
	_, err = db.Exec(createLikeTable)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`DELETE FROM likes WHERE tweetId == (?) AND authorId == (?);`, tweetData.IdTweet, tweetData.IdAuthor)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`UPDATE allTweet SET nblikes = nblikes - 1 WHERE tweetId = ?;`, tweetData.IdTweet)

	if err != nil {
		log.Fatal(err)
		return false
	}

	return true
}

func followAUser(tweetData FollowAUser) bool {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
		return false
	}

	defer db.Close()

	createLikeTable := `
		CREATE TABLE if not exists follow (
			IdAuthor integer not null,
			IdUserToFollow integer not null
		);
	`
	_, err = db.Exec(createLikeTable)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`INSERT INTO follow(IdAuthor, IdUserToFollow) VALUES (?, ?);`, tweetData.IdAuthor, tweetData.IdUserToFollow)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`UPDATE users SET nbFollowing = nbFollowing + 1 WHERE id = ?;`, tweetData.IdAuthor)

	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`UPDATE users SET nbFollower = nbFollower + 1 WHERE id = ?;`, tweetData.IdUserToFollow)

	if err != nil {
		log.Fatal(err)
	}

	return true
}

func unfollowAUser(tweetData FollowAUser) bool {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
		return false
	}

	defer db.Close()

	createLikeTable := `
		CREATE TABLE if not exists follow (
			IdAuthor integer not null,
			IdUserToFollow integer not null
		);
	`
	_, err = db.Exec(createLikeTable)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`DELETE FROM follow WHERE IdAuthor == ? AND IdUserToFollow == ?;`, tweetData.IdAuthor, tweetData.IdUserToFollow)

	if err != nil {
		log.Fatal(err)
		return false
	}

	_, err = db.Exec(`UPDATE users SET nbFollowing = nbFollowing - 1 WHERE id = ?;`, tweetData.IdAuthor)

	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`UPDATE users SET nbFollower = nbFollower - 1 WHERE id = ?;`, tweetData.IdUserToFollow)

	if err != nil {
		log.Fatal(err)
	}

	return true
}

func displayUser(idUser int) User {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var user User

	rows, _ := db.Query("SELECT * FROM users WHERE id == (?)", idUser)
	defer rows.Close()

	for rows.Next() {
		var id int
		var email string
		var pseudo string
		var username string
		var password string
		var profilePicture string
		var bio string
		var nbFollower string
		var nbFollowing string

		err := rows.Scan(&id, &email, &pseudo, &username, &password, &profilePicture, &bio, &nbFollower, &nbFollowing)
		if err != nil {
			fmt.Println(err)
		}

		user = User{
			Id:             id,
			Email:          email,
			Pseudo:         pseudo,
			Username:       username,
			Password:       password,
			ProfilePicture: profilePicture,
			Bio:            bio,
			NbFollower:     nbFollower,
			NbFollowing:    nbFollowing,
		}
	}

	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}

	return user
}

func displayComment(idTweet int) []TweetWithExtraData {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allTweet []TweetWithExtraData

	rowsOuter, _ := db.Query("SELECT * FROM allTweet WHERE isATweet == 0 AND idTweetReply == (?)", idTweet)
	defer rowsOuter.Close()

	for rowsOuter.Next() {
		var tweetId int
		var authorId int
		var authorName string
		var isATweet int
		var message string
		var nblikes int
		var date string
		var nbcomments int
		var idTweetReply int

		err := rowsOuter.Scan(&tweetId, &authorId, &authorName, &isATweet, &message, &nblikes, &date, &nbcomments, &idTweetReply)
		if err != nil {
			fmt.Println(err)
		}

		var tweet TweetWithExtraData

		rowsInner, _ := db.Query("SELECT pseudo, profilePicture FROM users WHERE id == (?);", authorId)
		defer rowsInner.Close()

		extraData := make(map[string]interface{})
		var pseudo string
		var profilePicture string

		for rowsInner.Next() {
			err := rowsInner.Scan(&pseudo, &profilePicture)
			if err != nil {
				fmt.Println(err)
			}
		}

		extraData["profilePicture"] = profilePicture
		extraData["username"] = authorName

		tweet = TweetWithExtraData{
			Tweet: Tweet{
				TweetId:      tweetId,
				AuthorId:     authorId,
				AuthorName:   pseudo,
				IsATweet:     isATweet,
				Message:      message,
				NbLikes:      nblikes,
				Date:         date,
				NbComments:   nbcomments,
				IdTweetReply: idTweetReply,
			},
			ExtraData: extraData,
		}

		allTweet = append(allTweet, tweet)
	}

	if err := rowsOuter.Err(); err != nil {
		fmt.Println(err)
	}

	return allTweet
}

func displayUniqueTweet(idTweet int) TweetWithExtraData {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var tweet TweetWithExtraData

	rows, _ := db.Query("SELECT * FROM allTweet WHERE tweetId == (?)", idTweet)
	defer rows.Close()

	for rows.Next() {
		var tweetId int
		var authorId int
		var pseudo string
		var isATweet int
		var message string
		var nblikes int
		var date string
		var nbcomments int
		var idTweetReply int

		err := rows.Scan(&tweetId, &authorId, &pseudo, &isATweet, &message, &nblikes, &date, &nbcomments, &idTweetReply)
		if err != nil {
			fmt.Println(err)
		}

		rowsInner, _ := db.Query("SELECT pseudo, profilePicture FROM users WHERE id == (?);", authorId)
		defer rowsInner.Close()

		extraData := make(map[string]interface{})
		var username string
		var profilePicture string

		for rowsInner.Next() {
			err := rowsInner.Scan(&username, &profilePicture)
			if err != nil {
				fmt.Println(err)
			}
			extraData["profilePicture"] = profilePicture
		}
		extraData["username"] = username

		tweet = TweetWithExtraData{
			Tweet: Tweet{
				TweetId:      tweetId,
				AuthorId:     authorId,
				AuthorName:   pseudo,
				IsATweet:     isATweet,
				Message:      message,
				NbLikes:      nblikes,
				Date:         date,
				NbComments:   nbcomments,
				IdTweetReply: idTweetReply,
			},
			ExtraData: extraData,
		}
	}

	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}

	return tweet
}

func displayAllTweet() []TweetWithExtraData {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allTweet []TweetWithExtraData

	rowsOuter, _ := db.Query("SELECT * FROM allTweet WHERE idTweetReply == 0")
	defer rowsOuter.Close()

	for rowsOuter.Next() {
		var tweetId int
		var authorId int
		var authorName string
		var isATweet int
		var message string
		var nblikes int
		var date string
		var nbcomments int
		var idTweetReply int

		err := rowsOuter.Scan(&tweetId, &authorId, &authorName, &isATweet, &message, &nblikes, &date, &nbcomments, &idTweetReply)
		if err != nil {
			fmt.Println(err)
		}

		var tweet TweetWithExtraData

		rowsInner, _ := db.Query("SELECT pseudo, profilePicture FROM users WHERE id == (?);", authorId)
		defer rowsInner.Close()

		extraData := make(map[string]interface{})
		var pseudo string
		var profilePicture string

		for rowsInner.Next() {
			err := rowsInner.Scan(&pseudo, &profilePicture)
			if err != nil {
				fmt.Println(err)
			}

			extraData["profilePicture"] = profilePicture
		}
		extraData["username"] = authorName

		tweet = TweetWithExtraData{
			Tweet: Tweet{
				TweetId:      tweetId,
				AuthorId:     authorId,
				AuthorName:   pseudo,
				IsATweet:     isATweet,
				Message:      message,
				NbLikes:      nblikes,
				Date:         date,
				NbComments:   nbcomments,
				IdTweetReply: idTweetReply,
			},
			ExtraData: extraData,
		}

		allTweet = append(allTweet, tweet)
	}

	if err := rowsOuter.Err(); err != nil {
		fmt.Println(err)
	}

	return allTweet
}

func displayAllLikeFromAUser(idAuthor int) []LikeATweet {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allLike []LikeATweet

	rows, _ := db.Query("SELECT * FROM likes WHERE authorId == (?)", idAuthor)
	defer rows.Close()

	for rows.Next() {
		var tweetId int
		var authorId int

		err := rows.Scan(&tweetId, &authorId)
		if err != nil {
			fmt.Println(err)
		}

		var like LikeATweet

		like = LikeATweet{
			IdTweet:  tweetId,
			IdAuthor: authorId,
		}

		allLike = append(allLike, like)
	}

	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}

	return allLike
}

func displayAllTweetFromUser(idUser int) []TweetWithExtraData {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allTweet []TweetWithExtraData

	rowsOuter, _ := db.Query("SELECT * FROM allTweet WHERE authorId == (?) AND isATweet == 1", idUser)
	defer rowsOuter.Close()

	for rowsOuter.Next() {
		var tweetId int
		var authorId int
		var authorName string
		var isATweet int
		var message string
		var nblikes int
		var date string
		var nbcomments int
		var idTweetReply int

		err := rowsOuter.Scan(&tweetId, &authorId, &authorName, &isATweet, &message, &nblikes, &date, &nbcomments, &idTweetReply)
		if err != nil {
			fmt.Println(err)
		}

		var tweet TweetWithExtraData

		rowsInner, _ := db.Query("SELECT pseudo, profilePicture FROM users WHERE id == (?);", authorId)
		defer rowsInner.Close()

		extraData := make(map[string]interface{})
		var pseudo string
		var profilePicture string

		for rowsInner.Next() {
			err := rowsInner.Scan(&pseudo, &profilePicture)
			if err != nil {
				fmt.Println(err)
			}

			extraData["profilePicture"] = profilePicture
		}
		extraData["username"] = authorName

		tweet = TweetWithExtraData{
			Tweet: Tweet{
				TweetId:      tweetId,
				AuthorId:     authorId,
				AuthorName:   pseudo,
				IsATweet:     isATweet,
				Message:      message,
				NbLikes:      nblikes,
				Date:         date,
				NbComments:   nbcomments,
				IdTweetReply: idTweetReply,
			},
			ExtraData: extraData,
		}

		allTweet = append(allTweet, tweet)
	}

	if err := rowsOuter.Err(); err != nil {
		fmt.Println(err)
	}

	return allTweet
}

func displayAllAnswerFromUser(idUser int) []TweetWithExtraData {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allTweet []TweetWithExtraData

	rowsOuter, _ := db.Query("SELECT * FROM allTweet WHERE authorId == (?) AND isATweet == 0", idUser)
	defer rowsOuter.Close()

	for rowsOuter.Next() {
		var tweetId int
		var authorId int
		var authorName string
		var isATweet int
		var message string
		var nblikes int
		var date string
		var nbcomments int
		var idTweetReply int

		err := rowsOuter.Scan(&tweetId, &authorId, &authorName, &isATweet, &message, &nblikes, &date, &nbcomments, &idTweetReply)
		if err != nil {
			fmt.Println(err)
		}

		var tweet TweetWithExtraData

		rowsInner, _ := db.Query("SELECT pseudo, profilePicture FROM users WHERE id == (?);", authorId)
		defer rowsInner.Close()

		extraData := make(map[string]interface{})
		var pseudo string
		var profilePicture string

		for rowsInner.Next() {
			err := rowsInner.Scan(&pseudo, &profilePicture)
			if err != nil {
				fmt.Println(err)
			}

			extraData["profilePicture"] = profilePicture
		}
		extraData["username"] = authorName

		tweet = TweetWithExtraData{
			Tweet: Tweet{
				TweetId:      tweetId,
				AuthorId:     authorId,
				AuthorName:   pseudo,
				IsATweet:     isATweet,
				Message:      message,
				NbLikes:      nblikes,
				Date:         date,
				NbComments:   nbcomments,
				IdTweetReply: idTweetReply,
			},
			ExtraData: extraData,
		}

		allTweet = append(allTweet, tweet)
	}

	if err := rowsOuter.Err(); err != nil {
		fmt.Println(err)
	}

	return allTweet
}

func displayAllLikeFromUser(idUser int) []LikeUser {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allLikeUser []LikeUser

	rowsOuter, _ := db.Query("SELECT tweetId FROM likes WHERE authorId == (?)", idUser)
	defer rowsOuter.Close()

	for rowsOuter.Next() {
		var tweetIdLike int
		var tweetId int
		var authorId int
		var username string
		var message string
		var nblikes int
		var nbcomments int
		var date string

		err := rowsOuter.Scan(&tweetIdLike)
		if err != nil {
			fmt.Println(err)
		}

		rowsInner, _ := db.Query("SELECT tweetId, authorId, authorName, message, nblikes, date, nbcomments FROM allTweet WHERE tweetId == (?);", tweetIdLike)
		defer rowsInner.Close()

		var pseudo string
		var profilePicture string

		for rowsInner.Next() {
			err := rowsInner.Scan(&tweetId, &authorId, &username, &message, &nblikes, &date, &nbcomments)
			if err != nil {
				fmt.Println(err)
			}
		}

		rowsInner2, _ := db.Query("SELECT pseudo, profilePicture FROM users WHERE id == (?);", authorId)
		defer rowsInner2.Close()

		for rowsInner2.Next() {
			err := rowsInner2.Scan(&pseudo, &profilePicture)
			if err != nil {
				fmt.Println(err)
			}
		}

		likeUser := LikeUser{
			TweetId:        tweetId,
			AuthorId:       authorId,
			Username:       username,
			Message:        message,
			Nblikes:        nblikes,
			Nbcomments:     nbcomments,
			Pseudo:         pseudo,
			ProfilePicture: profilePicture,
			Date:           date,
		}

		allLikeUser = append(allLikeUser, likeUser)
	}

	if err := rowsOuter.Err(); err != nil {
		fmt.Println(err)
	}

	return allLikeUser
}

func displayAllLikeFromUserTable(idUser int) []LikeATweet {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allLikeUser []LikeATweet

	rowsOuter, _ := db.Query("SELECT * FROM likes WHERE authorId == (?)", idUser)
	defer rowsOuter.Close()

	for rowsOuter.Next() {
		var tweetIdLike int
		var authorId int

		err := rowsOuter.Scan(&tweetIdLike, &authorId)
		if err != nil {
			fmt.Println(err)
		}

		likeUser := LikeATweet {
			IdTweet: tweetIdLike,
			IdAuthor: authorId,
		}

		allLikeUser = append(allLikeUser, likeUser)
	}

	if err := rowsOuter.Err(); err != nil {
		fmt.Println(err)
	}

	return allLikeUser
}

func displayUserData(idUser int) UserData {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var userData UserData

	rows, _ := db.Query("SELECT email, pseudo, username, profilePicture, bio, nbFollower, nbFollowing FROM users WHERE id == (?);", idUser)
	defer rows.Close()

	for rows.Next() {
		var email string
		var pseudo string
		var username string
		var profilePicture string
		var bio string
		var nbFollower int
		var nbFollowing int

		err := rows.Scan(&email, &pseudo, &username, &profilePicture, &bio, &nbFollower, &nbFollowing)
		if err != nil {
			fmt.Println(err)
		}

		userData = UserData{
			Email:          email,
			Pseudo:         pseudo,
			Username:       username,
			ProfilePicture: profilePicture,
			Bio:            bio,
			NbFollower:     nbFollower,
			NbFollowing:    nbFollowing,
		}
	}

	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}

	return userData
}

func displayAllUserFollow(idUser int) []FollowAUser {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allUser []FollowAUser

	rows, _ := db.Query("SELECT * FROM follow WHERE IdAuthor == (?)", idUser)
	defer rows.Close()

	for rows.Next() {
		var authorId int
		var userToFollow int

		err := rows.Scan(&authorId, &userToFollow)
		if err != nil {
			fmt.Println(err)
		}

		var follow FollowAUser

		follow = FollowAUser{
			IdAuthor:       authorId,
			IdUserToFollow: userToFollow,
		}

		allUser = append(allUser, follow)
	}

	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}

	return allUser
}

func displayAllUserFollowing(idUser int) []FollowAUser {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var allUser []FollowAUser

	rows, _ := db.Query("SELECT * FROM follow WHERE IdUserToFollow == (?)", idUser)
	defer rows.Close()

	for rows.Next() {
		var authorId int
		var userToFollow int

		err := rows.Scan(&authorId, &userToFollow)
		if err != nil {
			fmt.Println(err)
		}
		var follow FollowAUser

		follow = FollowAUser{
			IdAuthor:       authorId,
			IdUserToFollow: userToFollow,
		}

		allUser = append(allUser, follow)
	}

	if err := rows.Err(); err != nil {
		fmt.Println(err)
	}

	return allUser
}

func displayJson(data interface{}) {
	// Convertit les données en JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatal(err)
	}

	// Affiche le JSON résultant
	fmt.Println(string(jsonData))
}

func isFollowing(idUser int, userToFollow int) isFollowingAUser {
	dbstring := "./database.db"

	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	var follow isFollowingAUser

	rows, err := db.Query("SELECT COUNT(*) FROM follow WHERE IdAuthor = ? AND IdUserToFollow = ?;", idUser, userToFollow)
	if err != nil {
		log.Fatal("Erreur lors de la requête :", err)
	}

	defer rows.Close()

	var count int
	for rows.Next() {
		if err := rows.Scan(&count); err != nil {
			follow = isFollowingAUser{
				isFollow: false,
			}
		}
	}

	if count > 0 {
		follow = isFollowingAUser{
			isFollow: true,
		}
	} else {
		follow = isFollowingAUser{
			isFollow: false,
		}
	}

	return follow
}

func Home(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("./pages/index.html", "./templates/footer.html", "./templates/header.html")
	if err != nil {
		log.Fatal(err)
	}
	template.Execute(w, nil)
}

func Register(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("./pages/register.html", "./templates/footer.html", "./templates/header.html")
	if err != nil {
		log.Fatal(err)
	}
	template.Execute(w, nil)
}

func Loginn(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("./pages/login.html", "./templates/footer.html", "./templates/header.html")
	if err != nil {
		log.Fatal(err)
	}
	template.Execute(w, nil)
}

func Profile(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("./pages/profile.html", "./templates/footer.html", "./templates/header.html")
	if err != nil {
		log.Fatal(err)
	}
	template.Execute(w, nil)
}

func Follower(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("./pages/follower.html", "./templates/footer.html", "./templates/header.html")
	if err != nil {
		log.Fatal(err)
	}
	template.Execute(w, nil)
}

func TweetURL(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("./pages/tweetDetail.html", "./templates/footer.html", "./templates/header.html")
	if err != nil {
		log.Fatal(err)
	}
	id := r.URL.Query().Get("id")

	p, _ := strconv.Atoi(id)

	displayJson(displayUniqueTweet(p))

	template.Execute(w, nil)
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds NewUser

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(creds.Email) == 0 || len(creds.Password) == 0 {
		http.Error(w, "Email ou nom d'utilisateur manquant", http.StatusBadRequest)
		return
	} else {
		createUser(creds)
		w.WriteHeader(http.StatusOK)
	}
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	// Vérifier si la méthode de la requête est POST
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	var creds Login
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(creds.Email) == 0 || len(creds.Password) == 0 {
		http.Error(w, "Email ou nom d'utilisateur manquant", http.StatusBadRequest)
		return
	}

	dbstring := "./database.db"
	db, _ := sql.Open("sqlite3", dbstring)

	// Get the password
	var hashedPassword string
	err5 := db.QueryRow("SELECT password FROM users WHERE email = ?;", creds.Email).Scan(&hashedPassword)

	if err5 != nil {
		fmt.Println(err5)
	}

	// Hashed the password
	correctPassword := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(creds.Password))

	query := "SELECT COUNT(*) FROM users WHERE email = ?"
	var count int

	err = db.QueryRow(query, creds.Email).Scan(&count)

	if err != nil {
		http.Error(w, "Erreur lors de l'exécution de la requête", http.StatusInternalServerError)
		return
	}

	type IdUser struct {
		IdAuthor int
	}

	var user IdUser

	if count > 0 && correctPassword == nil {
		// User connected :

		rows, _ := db.Query("SELECT id FROM users WHERE email = ?", creds.Email)
		defer rows.Close()

		for rows.Next() {
			var authorId int

			err := rows.Scan(&authorId)
			if err != nil {
				fmt.Println(err)
			}

			user = IdUser{
				IdAuthor: authorId,
			}
		}

		jsonData, err := json.Marshal(user)
		if err != nil {
			http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		w.WriteHeader(http.StatusOK)
		w.Write(jsonData)
	} else {
		http.Error(w, "Erreur lors de la connexion", http.StatusInternalServerError)
		return
	}
}

func handleCreateTweet(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds NewTweet

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(creds.Message) <= 0 || len(creds.NameAuthor) <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Erreur")
		return
	}

	dbstring := "./database.db"
	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	createUserTable := `
		CREATE TABLE if not exists allTweet (
			tweetId integer not null primary key autoincrement,
			authorId integer not null,
			authorName text not null,
			isATweet int not null,
			message text not null,
			nblikes int not null,
			date text not null,
			nbcomments int not null,
			idTweetReply int not null
		);
	`
	_, err = db.Exec(createUserTable)

	if err != nil {
		log.Fatal(err)
	}

	currentTime := time.Now()
	formattedTime := currentTime.Format("02/01/2006 15:04:05")

	_, err = db.Exec(`INSERT INTO allTweet(authorId, authorName, isATweet, message, nblikes, date, nbcomments, idTweetReply)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, creds.IdAuthor, creds.NameAuthor, true, creds.Message, 0, formattedTime, 0, 0)

	if err != nil {
		log.Fatal(err)
	}

	io.WriteString(w, "Tweet Crée!")
	return
}

func handleCreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds NewComment

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(creds.Message) <= 0 || len(creds.NameAuthor) <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Erreur")
		return
	}

	dbstring := "./database.db"
	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	createUserTable := `
		CREATE TABLE if not exists allTweet (
			tweetId integer not null primary key autoincrement,
			authorId integer not null,
			authorName text not null,
			isATweet int not null,
			message text not null,
			nblikes int not null,
			date text not null,
			nbcomments int not null,
			idTweetReply int not null
		);
	`
	_, err = db.Exec(createUserTable)

	if err != nil {
		log.Fatal(err)
	}

	currentTime := time.Now()
	formattedTime := currentTime.Format("02/01/2006 15:04:05")

	_, err = db.Exec(`INSERT INTO allTweet(authorId, authorName, isATweet, message, nblikes, date, nbcomments, idTweetReply)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, creds.IdAuthor, creds.NameAuthor, false, creds.Message, 0, formattedTime, 0, creds.IdTweet)

	_, err = db.Exec(`UPDATE allTweet SET nbcomments = nbcomments + 1 WHERE tweetId = ?;`, creds.IdTweet)

	if err != nil {
		log.Fatal(err)
	}

	if err != nil {
		log.Fatal(err)
	}

	io.WriteString(w, "Tweet Crée!")
	return
}

func handleUpdateTweet(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds updateTweet

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(creds.NewMessage) <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Erreur")
		return
	}

	dbstring := "./database.db"
	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
		return
	}

	_, err2 := db.Exec(`UPDATE allTweet SET message = (?) WHERE tweetId = ?;`, creds.NewMessage, creds.TweetId)
	defer db.Close()

	if err2 != nil {
		log.Fatal(err2)
		return
	}

	io.WriteString(w, "Tweet Update")
	return
}

func handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds updateProfile

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dbstring := "./database.db"
	db, err := sql.Open("sqlite3", dbstring)

	if err != nil {
		log.Fatal(err)
		return
	}

	_, err2 := db.Exec(`UPDATE users SET pseudo = (?), profilePicture = (?), bio = (?) WHERE id = ?;`, creds.Pseudo, creds.ProfilePicture, creds.Bio, creds.UserId)
	defer db.Close()

	if err2 != nil {
		log.Fatal(err2)
		return
	}

	io.WriteString(w, "Profile Update")
	return
}

func handleAllTweet(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	tweets := displayAllTweet()

	jsonData, err := json.Marshal(tweets)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	w.Write(jsonData)
}

func handleDisplayAllTweetFromUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	allTweetFromUser := displayAllTweetFromUser(item)

	jsonData, err := json.Marshal(allTweetFromUser)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleDisplayAllAnswerFromUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	allTweetFromUser := displayAllAnswerFromUser(item)

	jsonData, err := json.Marshal(allTweetFromUser)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleDisplayAllLikeFromUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	allTweetFromUser := displayAllLikeFromUser(item)

	jsonData, err := json.Marshal(allTweetFromUser)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleDisplayUserLikeTable (w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	allTweetFromUser := displayAllLikeFromUserTable(item)

	jsonData, err := json.Marshal(allTweetFromUser)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleDisplayUserFollow(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	allUserFollow := displayAllUserFollow(item)

	var allUser []User

	for i := 0; i <= len(allUserFollow)-1; i++ {
		allUser = append(allUser, displayUser(allUserFollow[i].IdUserToFollow))
	}

	jsonData, err := json.Marshal(allUser)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleDisplayUserFollowing(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	allUserFollowing := displayAllUserFollowing(item)

	var allUser []User

	for i := 0; i <= len(allUserFollowing)-1; i++ {
		allUser = append(allUser, displayUser(allUserFollowing[i].IdAuthor))
	}

	jsonData, err := json.Marshal(allUser)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleAllComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	arrayJSON := [2]interface{}{
		displayUniqueTweet(item),
		displayComment(item),
	}

	jsonData, err := json.Marshal(arrayJSON)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	w.Write(jsonData)
}

func handleLikeATweet(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds LikeATweet

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if likeATweet(creds) {
		io.WriteString(w, "Tweets Liker !")
	} else {
		io.WriteString(w, "Error lors du like du tweet")
	}
}

func handleDislikeATweet(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds LikeATweet

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if dilikeATweet(creds) {
		io.WriteString(w, "Tweets Liker !")
	} else {
		io.WriteString(w, "Error lors du like du tweet")
	}
}

func handleFollowAUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds FollowAUser

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	followAUserFunction := followAUser(creds)

	if followAUserFunction {
		io.WriteString(w, "Abonnement reussi !")
	} else {
		io.WriteString(w, "Error lors de l'abonnement")
	}
}

func handleUnfollowAUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds FollowAUser

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if unfollowAUser(creds) {
		io.WriteString(w, "Abonnement reussi !")
	} else {
		io.WriteString(w, "Error lors de l'abonnement")
	}
}

func handleAllLikeFromAUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	allLikeFromAUser := displayAllLikeFromAUser(item)

	jsonData, err := json.Marshal(allLikeFromAUser)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleDisplayUserData(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	userData := displayUserData(item)

	jsonData, err := json.Marshal(userData)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleDisplayUserFullData(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données de la requête
	itemStr := r.URL.Query().Get("id")
	item, _ := strconv.Atoi(itemStr)

	userData := displayUser(item)

	jsonData, err := json.Marshal(userData)
	if err != nil {
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func handleIsFollowing(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds FollowAUser
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userData := isFollowing(creds.IdAuthor, creds.IdUserToFollow)

	jsonData, err := json.Marshal(userData.isFollow)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Erreur lors de la conversion en JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func main() {
	http.HandleFunc("/", Home)
	http.HandleFunc("/register", Register)
	http.HandleFunc("/login", Loginn)
	http.HandleFunc("/tweet", TweetURL)
	http.HandleFunc("/profile", Profile)
	http.HandleFunc("/follower", Follower)

	http.HandleFunc("/api/register", handleRegister)                                 // POST (Email, Name, Password, ProfilePicture)
	http.HandleFunc("/api/login", handleLogin)                                       // POST (Email, Password)
	http.HandleFunc("/api/allTweet", handleAllTweet)                                 // GET
	http.HandleFunc("/api/allComment", handleAllComment)                             // GET ?id
	http.HandleFunc("/api/createTweet", handleCreateTweet)                           // POST (IdAuthor, NameAuthor, Message)
	http.HandleFunc("/api/createComment", handleCreateComment)                       // POST (IdAuthor, NameAuthor, Message, IdTweet)
	http.HandleFunc("/api/updateTweet", handleUpdateTweet)                           // POST (IdAuthor, NameAuthor, Message, IdTweet)
	http.HandleFunc("/api/updateProfile", handleUpdateProfile)                       // POST (AuthorId, Pseudo, Bio, ProfilePicture)
	http.HandleFunc("/api/displayAllTweetFromUser", handleDisplayAllTweetFromUser)   // GET ?id
	http.HandleFunc("/api/displayAllAnswerFromUser", handleDisplayAllAnswerFromUser) // GET ?id
	http.HandleFunc("/api/displayAllLikeFromUser", handleDisplayAllLikeFromUser)     // GET ?id
	http.HandleFunc("/api/displayUserLikeTable", handleDisplayUserLikeTable)     	 // GET ?id
	http.HandleFunc("/api/likeATweet", handleLikeATweet)                             // POST (IdTweet, IdAuthor)
	http.HandleFunc("/api/dislikeATweet", handleDislikeATweet)                       // POST (IdTweet, IdAuthor)
	http.HandleFunc("/api/followAUser", handleFollowAUser)                           // POST (IdAuthor, IdUserToFollow)
	http.HandleFunc("/api/unfollowAUser", handleUnfollowAUser)                       // POST (IdAuthor, IdUserToFollow)
	http.HandleFunc("/api/displayFollow", handleDisplayUserFollow)                   // GET ?id
	http.HandleFunc("/api/displayFollowing", handleDisplayUserFollowing)             // GET ?id
	http.HandleFunc("/api/userAllLike", handleAllLikeFromAUser)                      // GET ?id
	http.HandleFunc("/api/getUserData", handleDisplayUserData)                       // GET ?id
	http.HandleFunc("/api/getUserFullData", handleDisplayUserFullData)               // GET ?id
	http.HandleFunc("/api/isFollowing", handleIsFollowing)                           // POST (IdAuthor, IdUserToFollow)

	fs := http.FileServer(http.Dir("static/"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	fmt.Println("Server running on port :8080")
	http.ListenAndServe(":8080", nil)
}
