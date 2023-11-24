package ehelper

import "os"

func FileIsExist(path string) bool {
	_, err := os.Stat(path)

	return err == nil || os.IsExist(err)
}

// func FileRead(path string) bool {
// 	data, err := os.ReadFile(path)
// 	if err != nil {
// 		logging.LogErrorf("read file failed: %s", err)
// 		return
// 	}
// }

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
