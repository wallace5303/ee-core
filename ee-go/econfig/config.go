package econfig

import (
	"fmt"
	"path/filepath"

	"ee-go/eapp"
	"ee-go/eerror"

	"github.com/spf13/viper"
)

var (
	Conf         = map[string]interface{}{}
	defaultViper *viper.Viper
	devViper     *viper.Viper
	prodViper    *viper.Viper
)

func Init() {
	defaultConfigPath := filepath.Join(eapp.GoDir, "config", "config.default.json")
	devConfigPath := filepath.Join(eapp.GoDir, "config", "config.local.json")
	prodConfigPath := filepath.Join(eapp.GoDir, "config", "config.prod.json")

	defaultViper = viper.New()
	defaultViper.SetConfigType("json")
	defaultViper.SetConfigFile(defaultConfigPath)
	defaultErr := defaultViper.ReadInConfig()
	if defaultErr != nil {
		eerror.ThrowWithCode(fmt.Sprintf("Fatal error config.default.json file: %s \n", defaultErr), eerror.ExitConfigDefaultFile)
	}

	if eapp.IsDev() {
		devViper = viper.New()
		devViper.SetConfigType("json")
		devViper.SetConfigFile(devConfigPath)
		devErr := devViper.ReadInConfig()
		if devErr != nil {
			eerror.ThrowWithCode(fmt.Sprintf("Fatal error config.local.json file: %s \n", devErr), eerror.ExitConfigDevFile)
		}
		defaultViper.MergeConfigMap(devViper.AllSettings())
	}

	if eapp.IsPord() {
		prodViper = viper.New()
		prodViper.SetConfigType("json")
		prodViper.SetConfigFile(prodConfigPath)
		prodErr := prodViper.ReadInConfig()
		if prodErr != nil {
			eerror.ThrowWithCode(fmt.Sprintf("Fatal error config.prod.json file: %s \n", prodErr), eerror.ExitConfigProdFile)
		}
		defaultViper.MergeConfigMap(prodViper.AllSettings())
	}

	//fmt.Printf("config : %v", defaultViper.AllSettings())
}

func GetAll() map[string]any {
	return defaultViper.AllSettings()
}

func GetLogger() any {
	return defaultViper.Get("logger")
}
