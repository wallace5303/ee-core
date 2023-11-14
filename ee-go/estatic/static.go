package estatic

import (
	"embed"
	"encoding/json"
	"fmt"

	"ee-go/eerror"
)

var (
	StaticFS embed.FS
)

func FileIsExist(name string) bool {
	_, err := StaticFS.ReadFile(name)

	return err == nil || false
}

// Read config json
func ReadConfigJson(f string) map[string]any {
	var ret map[string]any
	data, err := StaticFS.ReadFile(f)
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

// Read json
func ReadJson(f string) (map[string]any, error) {
	var ret map[string]any
	data, err := StaticFS.ReadFile(f)
	if nil != err {
		return nil, err
	}
	err = json.Unmarshal(data, &ret)
	if nil != err {
		return nil, err
	}

	return ret, nil
}
