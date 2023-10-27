package eapp

import (
	"fmt"
	"os"
	"os/exec"

	"path/filepath"

	"ee-go/econfig"
	"ee-go/eerror"
	"ee-go/elog"
	"ee-go/eos"
	"ee-go/eutil"
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

func New(cmdENV, cmdAppName, cmdAppUserData string) {

	ENV = cmdENV
	AppName = cmdAppName
	WorkDir = cmdAppUserData

	// [todo] 是否检查 core.exe 文件的位置是否正确（ee\resources\extraResources）
	// [todo] 是否把 public 文件复制到 extraResources, 或者直接打进 core.exe
	initDir()

	if AppName == "" {
		pkg := ReadPackage()
		if pkg.Name == "" {
			eerror.Throw("The app name is required!")
		}
		AppName = pkg.Name
	}

	initUserDir()

	// init config
	econfig.InitConfig()

	// [todo] init logger  读取config
	//elog.InitLogger(nil)

}

// Pwd gets the path of current working directory.
func Pwd() string {
	file, _ := exec.LookPath(os.Args[0])
	pwd, _ := filepath.Abs(file)

	return filepath.Dir(pwd)
}

func initDir() {
	HomeDir = BaseDir
	// if ENV == "prod" {
	// 	HomeDir = filepath.Join(WorkDir, "data")
	// }

	GoDir = filepath.Join(HomeDir, "go")
	PublicDir = filepath.Join(HomeDir, "public")

	fmt.Println("HomeDir:", HomeDir)
	fmt.Println("GoDir:", HomeDir)
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

	if WorkDir == "" {
		WorkDir = filepath.Join(UserHomeDir, AppName)
		// windows
		if eos.IsWindows() {
			// [todo] 判断一下userProfile路径中 有没有 Documents
			userProfile := os.Getenv("USERPROFILE")
			if userProfile != "" {
				WorkDir = filepath.Join(userProfile, "Documents", AppName)
			}
		}
	}
	if !eutil.FileIsExist(WorkDir) {
		if err := os.MkdirAll(WorkDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create app data folder [%s] failed: %s", WorkDir, err)
			eerror.Throw(errMsg)
		}
	}

	DataDir := filepath.Join(HomeDir, "data")
	if ENV == "prod" {
		DataDir = filepath.Join(WorkDir, "data")
	}
	if !eutil.FileIsExist(DataDir) {
		if err := os.MkdirAll(DataDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create data folder [%s] failed: %s", DataDir, err)
			eerror.Throw(errMsg)
		}
	}

	logDir := filepath.Join(HomeDir, "logs")
	if ENV == "prod" {
		logDir = filepath.Join(WorkDir, "logs")
	}
	if !eutil.FileIsExist(logDir) {
		if err := os.MkdirAll(logDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create logs folder [%s] failed: %s", logDir, err)
			eerror.Throw(errMsg)
		}
	}
	elog.SetLogDir(logDir)

	fmt.Println("UserHomeDir:", UserHomeDir)
	fmt.Println("UserHomeConfDir:", UserHomeConfDir)
	fmt.Println("WorkDir:", WorkDir)
	fmt.Println("DataDir:", DataDir)
	fmt.Println("logDir:", logDir)
}
