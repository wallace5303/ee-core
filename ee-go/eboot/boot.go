package eboot

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"ee-go/eapp"
	"ee-go/econfig"
	"ee-go/eerror"
	"ee-go/elog"
	"ee-go/eos"
	"ee-go/eutil"
	//figure "github.com/common-nighthawk/go-figure"
)

var (
	cmdENV = "prod" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
	cmdAppName     = ""
	cmdAppUserData = "" //
)

func Run() {
	// banner := figure.NewColorFigure("ElectronEgg", "standard", "green", true)
	// fmt.Println("\n" + banner.String())

	environment := flag.String("env", "prod", "dev/prod")
	appname := flag.String("appname", "", "app name")
	appUserData := flag.String("app-user-data", "", "The folder where you store your application configuration files")
	flag.Parse()

	fmt.Println("cmdENV:", *environment)
	fmt.Println("cmdAppName:", *appname)
	fmt.Println("cmdAppUserData:", *appUserData)

	cmdENV = *environment
	cmdAppName = *appname
	cmdAppUserData = *appUserData

	// [todo] 是否检查 core.exe 文件的位置是否正确（ee\resources\extraResources）
	// [todo] 是否把 public 文件复制到 extraResources, 或者直接打进 core.exe
	NewApp(cmdENV, cmdAppName, cmdAppUserData)
}

func NewApp(cmdENV, cmdAppName, cmdAppUserData string) {

	eapp.ENV = cmdENV
	eapp.AppName = cmdAppName
	eapp.WorkDir = cmdAppUserData

	// [todo] 是否检查 core.exe 文件的位置是否正确（ee\resources\extraResources）
	// [todo] 是否把 public 文件复制到 extraResources, 或者直接打进 core.exe
	initDir()

	if eapp.AppName == "" {
		pkg := eapp.ReadPackage()
		if pkg.Name == "" {
			eerror.Throw("The app name is required!")
		}
		eapp.AppName = pkg.Name
	}

	initUserDir()

	// init config
	econfig.InitConfig()

	// init logger
	//fmt.Printf("logConfig : %v", logConfig)
	elog.InitLogger(econfig.GetLogger())
	elog.Logger.Infof("test: %s", "----------")
}

func initDir() {
	eapp.HomeDir = eapp.BaseDir
	// if ENV == "prod" {
	// 	HomeDir = filepath.Join(WorkDir, "data")
	// }

	eapp.GoDir = filepath.Join(eapp.HomeDir, "go")
	eapp.PublicDir = filepath.Join(eapp.HomeDir, "public")

	fmt.Println("HomeDir:", eapp.HomeDir)
	fmt.Println("GoDir:", eapp.HomeDir)
	fmt.Println("PublicDir:", eapp.PublicDir)
}

func initUserDir() {
	eapp.UserHomeDir, _ = eos.GetUserHomeDir()
	eapp.UserHomeConfDir = filepath.Join(eapp.UserHomeDir, ".config", eapp.AppName)
	if !eutil.FileIsExist(eapp.UserHomeConfDir) {
		if err := os.MkdirAll(eapp.UserHomeConfDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create user home conf folder [%s] failed: %s", eapp.UserHomeConfDir, err)
			eerror.Throw(errMsg)
		}
	}

	if eapp.WorkDir == "" {
		eapp.WorkDir = filepath.Join(eapp.UserHomeDir, eapp.AppName)
		// windows
		if eos.IsWindows() {
			// [todo] 判断一下userProfile路径中 有没有 Documents
			userProfile := os.Getenv("USERPROFILE")
			if userProfile != "" {
				eapp.WorkDir = filepath.Join(userProfile, "Documents", eapp.AppName)
			}
		}
	}
	if !eutil.FileIsExist(eapp.WorkDir) {
		if err := os.MkdirAll(eapp.WorkDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create app data folder [%s] failed: %s", eapp.WorkDir, err)
			eerror.Throw(errMsg)
		}
	}

	DataDir := filepath.Join(eapp.HomeDir, "data")
	if eapp.IsPord() {
		DataDir = filepath.Join(eapp.WorkDir, "data")
	}
	if !eutil.FileIsExist(DataDir) {
		if err := os.MkdirAll(DataDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create data folder [%s] failed: %s", DataDir, err)
			eerror.Throw(errMsg)
		}
	}

	logDir := filepath.Join(eapp.HomeDir, "logs")
	if eapp.IsPord() {
		logDir = filepath.Join(eapp.WorkDir, "logs")
	}
	if !eutil.FileIsExist(logDir) {
		if err := os.MkdirAll(logDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create logs folder [%s] failed: %s", logDir, err)
			eerror.Throw(errMsg)
		}
	}
	elog.SetLogDir(logDir)

	fmt.Println("UserHomeDir:", eapp.UserHomeDir)
	fmt.Println("UserHomeConfDir:", eapp.UserHomeConfDir)
	fmt.Println("WorkDir:", eapp.WorkDir)
	fmt.Println("DataDir:", DataDir)
	fmt.Println("logDir:", logDir)
}
