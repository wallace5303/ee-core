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

func InitConfig() {
	defaultConfigPath := filepath.Join(eapp.GoDir, "config", "config.default.json")
	devConfigPath := filepath.Join(eapp.GoDir, "config", "config.local.json")
	prodConfigPath := filepath.Join(eapp.GoDir, "config", "config.prod.json")

	defaultViper := viper.New()
	defaultViper.SetConfigType("json")
	defaultViper.SetConfigFile(defaultConfigPath)
	defaultErr := defaultViper.ReadInConfig()
	if defaultErr != nil {
		eerror.Throw(fmt.Sprintf("Fatal error config.default.json file: %s \n", defaultErr))
	}

	if eapp.IsDev() {
		devViper := viper.New()
		devViper.SetConfigType("json")
		devViper.SetConfigFile(devConfigPath)
		devErr := devViper.ReadInConfig()
		if devErr != nil {
			eerror.Throw(fmt.Sprintf("Fatal error config.local.json file: %s \n", devErr))
		}
		defaultViper.MergeConfigMap(devViper.AllSettings())
	}

	if eapp.IsPord() {
		prodViper := viper.New()
		prodViper.SetConfigType("json")
		prodViper.SetConfigFile(prodConfigPath)
		prodErr := prodViper.ReadInConfig()
		if prodErr != nil {
			eerror.Throw(fmt.Sprintf("Fatal error config.prod.json file: %s \n", prodErr))
		}
		defaultViper.MergeConfigMap(prodViper.AllSettings())
	}

	fmt.Printf("defaultViper: %v", defaultViper.AllSettings())

	// Conf := readConfigFile(defaultConfigPath)
	// if eutil.FileIsExist(devConfigPath) {
	// 	devConfig := readConfigFile(devConfigPath)
	// 	eutil.MapMerge(Conf, devConfig)
	// }

	// if eutil.FileIsExist(prodConfigPath) {
	// 	prodConfig := readConfigFile(prodConfigPath)
	// 	eutil.MapMerge(Conf, prodConfig)
	// }

	// res := viper.AllSettings()
	// fmt.Printf("res: %v", res)

	// res1 := viper.AllKeys()
	// fmt.Printf("res1: %v", res1)
}

// read config file and clean viper
// func readConfigFile(path string) map[string]interface{} {
// 	data, err := os.ReadFile(path)
// 	if err != nil {
// 		msg := fmt.Sprintf("read file failed: %s", err)
// 		eerror.Throw(msg)
// 	}

// 	viper.SetConfigType("json")
// 	viper.ReadConfig(bytes.NewBuffer(data))
// 	if err := viper.ReadConfig(bytes.NewBuffer(data)); err != nil {
// 		panic(err)
// 	}
// 	res := viper.AllSettings()

// 	viper.Reset()
// 	return res
// }
