package econfig

import (
	"fmt"
	"path/filepath"

	"ee-go/eapp"

	"github.com/spf13/viper"
)

func InitConfig() {
	defaultConfigPath := filepath.Join(eapp.GoDir, "config", "config.default.json")
	devConfigPath := filepath.Join(eapp.GoDir, "config", "config.dev.json")
	prodConfigPath := filepath.Join(eapp.GoDir, "config", "config.prod.json")

	viper.SetConfigType("json")
	viper.SetConfigFile(defaultConfigPath)
	err := viper.ReadInConfig()
	if err != nil {
		panic(fmt.Errorf("Fatal error config file: %s \n", err))
	}
	mysql := viper.Get("mysql")
	fmt.Println(mysql)

}
