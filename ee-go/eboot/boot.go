package eboot

import (
	"embed"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"ee-go/eapp"
	"ee-go/econfig"
	"ee-go/eerror"
	"ee-go/elog"
	"ee-go/eos"
	"ee-go/eruntime"
	"ee-go/eserver"
	"ee-go/estatic"
	"ee-go/eutil"

	figure "github.com/common-nighthawk/go-figure"
)

var (
	cmdENV = "prod" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
)

func New(staticFS embed.FS) {
	banner := figure.NewColorFigure("ElectronEgg", "standard", "green", true)
	fmt.Println("\n" + banner.String())

	environment := flag.String("env", "prod", "dev/prod")
	flag.Parse()
	fmt.Println("cmdENV:", *environment)

	cmdENV = *environment

	// static "./public"
	estatic.StaticFS = staticFS

	initApp(cmdENV)
}

func initApp(cmdENV string) {
	eruntime.ENV = cmdENV

	// init dir
	eruntime.InitDir()

	// init config
	econfig.Init()

	pkg := eapp.ReadPackage()
	pkgName := pkg["name"].(string)
	if pkgName == "" {
		eerror.ThrowWithCode("The app name is required!", eerror.ExitAppNameIsEmpty)
	}
	eruntime.AppName = pkgName

	// init user dir
	initUserDir()

	// init logger
	logCfg := econfig.GetLogger()
	elog.Init(logCfg)

	// http server
	httpCfg := econfig.GetHttp()
	if httpCfg["enable"] == true {
		eserver.Init("http", httpCfg)
	}

	// test
	eruntime.Debug()
}

func initUserDir() {
	eruntime.PublicDir = filepath.Join(eruntime.HomeDir, "public")
	eruntime.UserHomeDir, _ = eos.GetUserHomeDir()
	eruntime.UserHomeConfDir = filepath.Join(eruntime.UserHomeDir, ".config", eruntime.AppName)
	if !eutil.FileIsExist(eruntime.UserHomeConfDir) {
		if err := os.MkdirAll(eruntime.UserHomeConfDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create user home conf folder [%s] failed: %s", eruntime.UserHomeConfDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateUserHomeConfDir)
		}
	}

	if eruntime.IsDev() {
		eruntime.WorkDir = eruntime.HomeDir
	}
	if eruntime.IsPord() {
		eruntime.WorkDir = filepath.Join(eruntime.UserHomeDir, eruntime.AppName)
		// windows
		if eos.IsWindows() {
			// [todo] 判断一下userProfile路径中 有没有 Documents
			userProfile := os.Getenv("USERPROFILE")
			//fmt.Println("userProfile:", userProfile)
			if userProfile != "" {
				eruntime.WorkDir = filepath.Join(userProfile, "Documents", eruntime.AppName)
			}
		}
	}
	if !eutil.FileIsExist(eruntime.WorkDir) {
		if err := os.MkdirAll(eruntime.WorkDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create work folder [%s] failed: %s", eruntime.WorkDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateWorkDir)
		}
	}

	eruntime.DataDir = filepath.Join(eruntime.WorkDir, "data")
	if !eutil.FileIsExist(eruntime.DataDir) {
		if err := os.MkdirAll(eruntime.DataDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create data folder [%s] failed: %s", eruntime.DataDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateDataDir)
		}
	}

	logDir := filepath.Join(eruntime.WorkDir, "logs")
	if !eutil.FileIsExist(logDir) {
		if err := os.MkdirAll(logDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create logs folder [%s] failed: %s", logDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateLogDir)
		}
	}
	elog.SetLogDir(logDir)

	// [todo]
	eruntime.TmpDir = filepath.Join(eruntime.WorkDir, "data", "tmp")
	os.RemoveAll(eruntime.TmpDir)
	if !eutil.FileIsExist(eruntime.TmpDir) {
		if err := os.MkdirAll(eruntime.TmpDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create tmp folder [%s] failed: %s", eruntime.TmpDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateTmpDir)
		}
	}
	os.Setenv("TMPDIR", eruntime.TmpDir)
	os.Setenv("TEMP", eruntime.TmpDir)
	os.Setenv("TMP", eruntime.TmpDir)
}

func Run() {
	eapp.Run()
}
