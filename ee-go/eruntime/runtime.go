package eruntime

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

var (
	Version = "0.1.0"
	ENV     = "dev" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description

	HttpServer = false
	AppName    = ""
	Platform   = "pc" // pc | mobile | web
	IsExiting  = false
)

var (
	BaseDir, _      = os.Getwd()
	PublicDir       string // electron-egg public directory
	UserHomeDir     string // OS user home directory
	UserHomeConfDir string // OS user home config directory
	WorkDir         string // App working directory
	DataDir         string // data directory
	TmpDir          string // tmp directory
)

var (
	Port                = "7073"
	SSL                 = false
	HttpServerIsRunning = false
)

func InitDir() {
	PublicDir = filepath.Join(BaseDir, "public")

	fmt.Println("BaseDir:", BaseDir)
	fmt.Println("PublicDir:", PublicDir)
}

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
