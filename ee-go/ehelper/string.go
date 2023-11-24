package ehelper

import (
	"math/rand"
	"time"
)

// String returns a random string ['a', 'z'] and ['0', '9'] in the specified length.
func GetRandomString(length int) string {
	rand.Seed(time.Now().UTC().UnixNano())
	time.Sleep(10 * time.Nanosecond)

	letter := []rune("abcdefghijklmnopqrstuvwxyz0123456789")
	b := make([]rune, length)
	for i := range b {
		b[i] = letter[rand.Intn(len(letter))]
	}
	return string(b)
}
