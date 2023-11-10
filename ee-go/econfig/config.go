package econfig

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"ee-go/eapp"
	"ee-go/eerror"
	"ee-go/eutil"

	"github.com/spf13/viper"
)

var (
	Vip *viper.Viper
)

func Init() {
	var defaultCfg map[string]any

	if eapp.IsDev() {
		defaultConfigPath := filepath.Join(eapp.GoDir, "config", "config.default.json")
		devConfigPath := filepath.Join(eapp.GoDir, "config", "config.local.json")

		defaultCfg = ReadJson(defaultConfigPath)
		devCfg := ReadJson(devConfigPath)

		// merge
		eutil.Mapserge(devCfg, defaultCfg, nil)
	}

	if eapp.IsPord() {
		defaultCfg = ReadJsonFromStaticFS("static/config/config.default.json")
		prodCfg := ReadJsonFromStaticFS("static/config/config.prod.json")

		// merge
		eutil.Mapserge(prodCfg, defaultCfg, nil)
	}

	Vip = viper.New()
	for key, value := range defaultCfg {
		Vip.Set(key, value)
	}
	//fmt.Printf("config : %v", Vip.AllSettings())
}

func Get(key string) any {
	return Vip.Get(key)
}

func GetAll() map[string]any {
	return Vip.AllSettings()
}

func GetLogger() map[string]any {
	cfg := Vip.Get("logger")
	logCfg, ok := cfg.(map[string]any)
	if !ok {
		eerror.ThrowWithCode("Get logger config error !", eerror.ExitLogConfigErr)
	}
	return logCfg
}

func GetHttp() map[string]any {
	cfg := Vip.Get("http")
	httpCfg, ok := cfg.(map[string]any)
	if !ok {
		eerror.ThrowWithCode("Get http config error !", eerror.ExitHttpConfigErr)
	}

	return httpCfg
}

// Read config json
func ReadJson(f string) map[string]any {
	if !eutil.FileIsExist(f) {
		msg := fmt.Sprintf("File: %s is not exist \n", f)
		eerror.ThrowWithCode(msg, eerror.ExitConfigFileNotExist)
	}

	data, err := os.ReadFile(f)
	if nil != err {
		msg := fmt.Sprintf("Read file: %s failed: %s\n", f, err)
		eerror.ThrowWithCode(msg, eerror.ExitConfigFile)
	}

	var ret map[string]any
	err = json.Unmarshal(data, &ret)
	if nil != err {
		msg := fmt.Sprintf("unmarshal file: %s failed: %s", f, err)
		eerror.ThrowWithCode(msg, eerror.ExitConfigFile)
	}

	return ret
}

// Read config json from StaticFS (prod)
func ReadJsonFromStaticFS(f string) map[string]any {
	var ret map[string]any
	data, err := eapp.StaticFS.ReadFile(f)
	if nil != err {
		msg := fmt.Sprintf("Read file: %s failed: %s\n", f, err)
		eerror.ThrowWithCode(msg, eerror.ExitConfigFileFS)
	}
	err = json.Unmarshal(data, &ret)
	if nil != err {
		msg := fmt.Sprintf("unmarshal file: %s failed: %s", f, err)
		eerror.ThrowWithCode(msg, eerror.ExitConfigFileFS)
	}

	return ret
}
