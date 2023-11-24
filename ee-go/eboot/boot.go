package eboot

import (
	"embed"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"ee-go/eapp"
	"ee-go/econfig"
	"ee-go/eerror"
	"ee-go/ehelper"
	"ee-go/ehttp"
	"ee-go/elog"
	"ee-go/eos"
	"ee-go/eruntime"
	"ee-go/estatic"
)

var (
// cmdENV  = "prod" // 'dev' 'prod'
// cmdPort = "0"
)

type Ego struct {
}

func (ego *Ego) Run() {
	eapp.Run()
}

func New(staticFS embed.FS) *Ego {
	// args
	environment := flag.String("env", "prod", "dev/prod")
	baseDir := flag.String("basedir", "./", "base directory")
	port := flag.String("port", "", "service port")
	ssl := flag.String("ssl", "false", "https/wss service")

	flag.Parse()

	fmt.Println("cmdENV:", *environment)
	fmt.Println("baseDir:", *baseDir)
	fmt.Println("goport:", *port)
	fmt.Println("ssl:", *ssl)

	eruntime.ENV = *environment
	eruntime.BaseDir = filepath.Join(eruntime.BaseDir, *baseDir)
	cmdGoPort, err := strconv.Atoi(*port)
	if err == nil && cmdGoPort > 0 {
		eruntime.Port = *port
	}
	eruntime.SSL, _ = strconv.ParseBool(*ssl)

	// static "./public"
	estatic.StaticFS = staticFS

	fmt.Println("ENV:", eruntime.ENV)
	fmt.Println("BaseDir:", eruntime.BaseDir)
	fmt.Println("Port:", eruntime.Port)
	fmt.Println("SSL:", eruntime.SSL)

	initApp()

	ego := &Ego{}
	return ego
}

func initApp() {

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
		ehttp.CreateServer(httpCfg)
	}

}

func initUserDir() {
	eruntime.UserHomeDir, _ = eos.GetUserHomeDir()
	eruntime.UserHomeConfDir = filepath.Join(eruntime.UserHomeDir, ".config", eruntime.AppName)
	if !ehelper.FileIsExist(eruntime.UserHomeConfDir) {
		if err := os.MkdirAll(eruntime.UserHomeConfDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create user home conf folder [%s] failed: %s", eruntime.UserHomeConfDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateUserHomeConfDir)
		}
	}

	eruntime.WorkDir = eruntime.BaseDir
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
	if !ehelper.FileIsExist(eruntime.WorkDir) {
		if err := os.MkdirAll(eruntime.WorkDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create work folder [%s] failed: %s", eruntime.WorkDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateWorkDir)
		}
	}

	eruntime.DataDir = filepath.Join(eruntime.WorkDir, "data")
	if !ehelper.FileIsExist(eruntime.DataDir) {
		if err := os.MkdirAll(eruntime.DataDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create data folder [%s] failed: %s", eruntime.DataDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateDataDir)
		}
	}

	logDir := filepath.Join(eruntime.WorkDir, "logs")
	if !ehelper.FileIsExist(logDir) {
		if err := os.MkdirAll(logDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create logs folder [%s] failed: %s", logDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateLogDir)
		}
	}
	elog.SetLogDir(logDir)

	eruntime.TmpDir = filepath.Join(eruntime.DataDir, "tmp")
	os.RemoveAll(eruntime.TmpDir)
	if !ehelper.FileIsExist(eruntime.TmpDir) {
		if err := os.MkdirAll(eruntime.TmpDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create tmp folder [%s] failed: %s", eruntime.TmpDir, err)
			eerror.ThrowWithCode(errMsg, eerror.ExitCreateTmpDir)
		}
	}
	os.Setenv("TMPDIR", eruntime.TmpDir)
	os.Setenv("TEMP", eruntime.TmpDir)
	os.Setenv("TMP", eruntime.TmpDir)

	fmt.Println("UserHomeDir:", eruntime.UserHomeDir)
	fmt.Println("UserHomeConfDir:", eruntime.UserHomeConfDir)
	fmt.Println("WorkDir:", eruntime.WorkDir)
	fmt.Println("DataDir:", eruntime.DataDir)
	fmt.Println("TmpDir:", eruntime.TmpDir)
}
