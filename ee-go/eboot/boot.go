package eboot

import (
	"flag"
	"fmt"

	"ee-go/eapp"

	figure "github.com/common-nighthawk/go-figure"
)

var (
	cmdENV = "prod" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
	cmdAppName     = ""
	cmdAppUserData = "" //
)

func Run() {
	banner := figure.NewColorFigure("ElectronEgg", "standard", "green", true)
	fmt.Println("\n" + banner.String())

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
	eapp.New(cmdENV, cmdAppName, cmdAppUserData)
}
