package eapp

import (
	"flag"
	"fmt"
	"os"
	"os/exec"

	"path/filepath"

	"ee-go/eerror"
	"ee-go/eos"
	"ee-go/eutil"

	figure "github.com/common-nighthawk/go-figure"
)

const (
	Version = "0.1.0"
)

var (
	ENV = "prod" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
	HttpServer = false
	AppName    = ""
	Platform   = "pc" // pc | mobile | web
)

var (
	BaseDir, _      = os.Getwd()
	HomeDir         string // electron-egg home directory
	PublicDir       string // electron-egg public directory
	UserHomeDir     string // OS user home directory
	UserHomeConfDir string // OS user home config directory
	DataDir         string // electron app.getPath('userData')

	// cmd args
	// cmdEnv     string
	// cmdAppname string
	// cmdDataDir string
)

func Run() {
	banner := figure.NewColorFigure("ElectronEgg", "standard", "green", true)
	fmt.Println("\n" + banner.String())

	environment := flag.String("env", "prod", "dev/prod")
	appname := flag.String("appname", "", "app name")
	appUserData := flag.String("app-user-data", "", "The folder where you store your application configuration files")
	flag.Parse()

	fmt.Println("ENV:", *environment)
	fmt.Println("AppName:", *appname)
	fmt.Println("AppUserDataDir:", *appUserData)

	ENV = *environment
	AppName = *appname
	DataDir = *appUserData

	// [todo] 是否检查 core.exe 文件的位置是否正确（ee\resources\extraResources）
	// [todo] 是否把 public 文件复制到 extraResources, 或者直接打进 core.exe
	// [todo] prod HomeDir 修改

	userProfile := os.Getenv("USERPROFILE")
	fmt.Println("userProfile:", userProfile)

	initDir()

	if AppName == "" {
		pkg := ReadPackage()
		if pkg.Name == "" {
			eerror.Throw("The app name is required!")
		}
		AppName = pkg.Name
		//fmt.Printf("pkg: %+v", pkg)
		// eerror.Throw(pkg)
	}

	initUserDir()
	//logger := elog.GetLogger()
	//logger := elog.CreateLogger()
	// logger.Infof("hconf example success tttt")
}

// Pwd gets the path of current working directory.
func Pwd() string {
	file, _ := exec.LookPath(os.Args[0])
	pwd, _ := filepath.Abs(file)

	return filepath.Dir(pwd)
}

func initDir() {
	HomeDir = filepath.Join(BaseDir, "..")
	PublicDir = filepath.Join(HomeDir, "public")

	fmt.Println("HomeDir:", HomeDir)
	fmt.Println("PublicDir:", PublicDir)
}

func initUserDir() {
	UserHomeDir, _ = eos.GetUserHomeDir()
	UserHomeConfDir := filepath.Join(UserHomeDir, ".config", AppName)
	if !eutil.FileIsExist(UserHomeConfDir) {
		if err := os.MkdirAll(UserHomeConfDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create user home conf folder [%s] failed: %s", UserHomeConfDir, err)
			eerror.Throw(errMsg)
		}
	}

	if DataDir != "" {
		DataDir = filepath.Join(UserHomeDir, AppName)
		// windows
		if eos.IsWindows() {
			userProfile := os.Getenv("USERPROFILE")
			if userProfile != "" {
				DataDir = filepath.Join(userProfile, "Documents", AppName)
			}
		}
	}
	if !eutil.FileIsExist(DataDir) {
		if err := os.MkdirAll(DataDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create app data folder [%s] failed: %s", DataDir, err)
			eerror.Throw(errMsg)
		}
	}

	logDir := filepath.Join(HomeDir, "logs")
	if ENV == "prod" {
		if DataDir != "" && eutil.FileIsExist(DataDir) {
			logDir = filepath.Join(DataDir, "logs")
		}
	}
	if !eutil.FileIsExist(logDir) {
		if err := os.MkdirAll(logDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create logs folder [%s] failed: %s", logDir, err)
			eerror.Throw(errMsg)
		}
	}

	fmt.Println("UserHomeDir:", UserHomeDir)
	fmt.Println("UserHomeConfDir:", UserHomeConfDir)
	fmt.Println("logDir:", logDir)
}
