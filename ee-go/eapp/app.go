package eapp

import (
	"os"
	"os/exec"

	"path/filepath"
)

const (
	Version = "0.1.0"
)

var (
	ENV = "dev" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
	HttpServer = false
	AppName    = ""
	Platform   = "pc" // pc | mobile | web
)

var (
	BaseDir, _      = os.Getwd()
	HomeDir         string // electron-egg home directory
	GoDir           string // electron-egg go directory
	PublicDir       string // electron-egg public directory
	UserHomeDir     string // OS user home directory
	UserHomeConfDir string // OS user home config directory
	WorkDir         string // App working directory
	DataDir         string // data directory
)

// Pwd gets the path of current working directory.
func IsPord() bool {
	return (ENV == "prod")
}

func IsDev() bool {
	return (ENV == "dev")
}

func Pwd() string {
	file, _ := exec.LookPath(os.Args[0])
	pwd, _ := filepath.Abs(file)

	return filepath.Dir(pwd)
}
