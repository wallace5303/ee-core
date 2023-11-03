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
	"ee-go/eserver"
	"ee-go/eutil"
	//figure "github.com/common-nighthawk/go-figure"
)

var (
	cmdENV = "prod" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
	cmdAppName = ""
)

func Run() {
	// banner := figure.NewColorFigure("ElectronEgg", "standard", "green", true)
	// fmt.Println("\n" + banner.String())

	environment := flag.String("env", "prod", "dev/prod")
	appname := flag.String("appname", "", "app name")
	flag.Parse()

	fmt.Println("cmdENV:", *environment)
	fmt.Println("cmdAppName:", *appname)

	cmdENV = *environment
	cmdAppName = *appname

	// [todo] 是否检查 core.exe 文件的位置是否正确（ee\resources\extraResources）
	// [todo] 是否把 public 文件复制到 extraResources, 或者直接打进 core.exe
	NewApp(cmdENV, cmdAppName)
}

func NewApp(cmdENV, cmdAppName string) {

	eapp.ENV = cmdENV
	eapp.AppName = cmdAppName

	// [todo] 是否检查 core.exe 文件的位置是否正确（ee\resources\extraResources）
	// [todo] 是否把 public 文件复制到 extraResources, 或者直接打进 core.exe
	initDir()

	if eapp.AppName == "" {
		pkg := eapp.ReadPackage()
		if pkg.Name == "" {
			eerror.ThrowWithCode("The app name is required!", eerror.ExitAppNameIsEmpty)
		}
		eapp.AppName = pkg.Name
	}

	initUserDir()

	// init config
	econfig.InitConfig()

	// init logger
	elog.InitLogger(econfig.GetLogger())
	elog.Logger.Infof("test: %s", "----------")
	//elog.Infof("test2: %s", "----------")

	// init http server
	eserver.InitServer()

}

func initDir() {
	eapp.HomeDir = filepath.Join(eapp.BaseDir, "..")
	if eapp.IsPord() {
		eapp.HomeDir = eapp.BaseDir
	}

	eapp.GoDir = filepath.Join(eapp.HomeDir, "go")
	if eapp.IsPord() {
		eapp.GoDir = eapp.BaseDir
	}

	eapp.PublicDir = filepath.Join(eapp.HomeDir, "public")
	// [todo]
	// if eapp.IsPord() {

	// }

	fmt.Println("BaseDir:", eapp.BaseDir)
	fmt.Println("HomeDir:", eapp.HomeDir)
	fmt.Println("GoDir:", eapp.GoDir)
	fmt.Println("PublicDir:", eapp.PublicDir)
}

func initUserDir() {
	eapp.UserHomeDir, _ = eos.GetUserHomeDir()
	eapp.UserHomeConfDir = filepath.Join(eapp.UserHomeDir, ".config", eapp.AppName)
	if !eutil.FileIsExist(eapp.UserHomeConfDir) {
		if err := os.MkdirAll(eapp.UserHomeConfDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create user home conf folder [%s] failed: %s", eapp.UserHomeConfDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateUserHomeConfDir)
		}
	}

	if eapp.IsDev() {
		eapp.WorkDir = eapp.HomeDir
	}
	if eapp.IsPord() {
		eapp.WorkDir = filepath.Join(eapp.UserHomeDir, eapp.AppName)
		// windows
		if eos.IsWindows() {
			// [todo] 判断一下userProfile路径中 有没有 Documents
			userProfile := os.Getenv("USERPROFILE")
			//fmt.Println("userProfile:", userProfile)
			if userProfile != "" {
				eapp.WorkDir = filepath.Join(userProfile, "Documents", eapp.AppName)
			}
		}
	}
	if !eutil.FileIsExist(eapp.WorkDir) {
		if err := os.MkdirAll(eapp.WorkDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create work folder [%s] failed: %s", eapp.WorkDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateWorkDir)
		}
	}

	eapp.DataDir = filepath.Join(eapp.WorkDir, "data")
	if !eutil.FileIsExist(eapp.DataDir) {
		if err := os.MkdirAll(eapp.DataDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create data folder [%s] failed: %s", eapp.DataDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateDataDir)
		}
	}

	logDir := filepath.Join(eapp.WorkDir, "logs")
	if !eutil.FileIsExist(logDir) {
		if err := os.MkdirAll(logDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create logs folder [%s] failed: %s", logDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateLogDir)
		}
	}
	elog.SetLogDir(logDir)

	// [todo]
	eapp.TmpDir = filepath.Join(eapp.WorkDir, "data", "tmp")
	os.RemoveAll(eapp.TmpDir)
	if !eutil.FileIsExist(eapp.TmpDir) {
		if err := os.MkdirAll(eapp.TmpDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create tmp folder [%s] failed: %s", eapp.TmpDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateTmpDir)
		}
	}
	os.Setenv("TMPDIR", eapp.TmpDir)
	os.Setenv("TEMP", eapp.TmpDir)
	os.Setenv("TMP", eapp.TmpDir)

	fmt.Println("UserHomeDir:", eapp.UserHomeDir)
	fmt.Println("UserHomeConfDir:", eapp.UserHomeConfDir)
	fmt.Println("WorkDir:", eapp.WorkDir)
	fmt.Println("DataDir:", eapp.DataDir)
	fmt.Println("logDir:", logDir)
	fmt.Println("TmpDir:", eapp.TmpDir)
}
