package eutil

import (
	"encoding/json"
	"fmt"
	"os"

	"ee-go/eerror"
)

// Read json strict
func ReadJsonStrict(f string) map[string]any {
	if !FileIsExist(f) {
		msg := fmt.Sprintf("File: %s is not exist !", f)
		eerror.ThrowWithCode(msg, eerror.ExitConfigFileNotExist)
	}

	data, err := os.ReadFile(f)
	if nil != err {
		msg := fmt.Sprintf("Read file: %s failed: %s", f, err)
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

// Read json
func ReadJson(f string) (map[string]any, error) {
	var ret map[string]any
	data, err := os.ReadFile(f)
	if nil != err {
		return nil, err
	}
	err = json.Unmarshal(data, &ret)
	if nil != err {
		return nil, err
	}

	return ret, nil
}
