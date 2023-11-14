package econfig

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"ee-go/eerror"
	"ee-go/eruntime"
	"ee-go/estatic"
	"ee-go/eutil"

	"github.com/spf13/viper"
)

var (
	Vip *viper.Viper
)

func Init() {
	var defaultCfg map[string]any
	var envCfg map[string]any

	if eruntime.IsPord() {
		defaultCfg = estatic.ReadConfigJson("public/config/config.default.json")
		envCfg = estatic.ReadConfigJson("public/config/config.prod.json")

		// [todo] read other config

	}

	if eruntime.IsDev() {
		defaultConfigPath := filepath.Join(eruntime.GoDir, "config", "config.default.json")
		devConfigPath := filepath.Join(eruntime.GoDir, "config", "config.local.json")

		defaultCfg = ReadJson(defaultConfigPath)
		envCfg = ReadJson(devConfigPath)
	}

	// merge
	eutil.Mapserge(envCfg, defaultCfg, nil)

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

func GetStatic() map[string]any {
	cfg := Vip.Get("static")
	logCfg, ok := cfg.(map[string]any)
	if !ok {
		eerror.ThrowWithCode("Get static config error !", eerror.ExitLogConfigErr)
	}
	return logCfg
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
