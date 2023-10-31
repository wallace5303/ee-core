package eutil

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
