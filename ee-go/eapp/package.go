package eapp

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"ee-go/econfig"
	"ee-go/eerror"
	"ee-go/eruntime"
	"ee-go/estatic"
	"ee-go/eutil"
)

// type Package struct {
// 	Name        string `json:"name"`        // app name
// 	Version     string `json:"version"`     // app version
// 	Description string `json:"description"` // description
// 	Main        string `json:"main"`        // electron main file
// 	Repository  string `json:"repository"`  // project repository
// 	Author      string `json:"author"`      // author
// 	License     string `json:"license"`     // project license
// }

// func NewPackage() *Package {
// 	return &Package{
// 		Name:        "",
// 		Version:     "",
// 		Description: "",
// 		Main:        "",
// 		Repository:  "",
// 		Author:      "",
// 		License:     "",
// 	}
// }

// get package.json
func ReadPackage() map[string]any {
	var ret map[string]any

	if eruntime.IsPord() {
		staticCfg := econfig.GetStatic()
		if staticCfg["enable"] == true {
			pkgData, err := estatic.ReadJson("public/package.json")
			if err != nil {
				eerror.ThrowWithCode("StaticFS package.json does not exist!", eerror.ExitPackageFile)
			}
			ret = pkgData
		}
	}

	// read from external file
	if len(ret) == 0 {
		pkgPath := filepath.Join(eruntime.BaseDir, "package.json")
		if !eutil.FileIsExist(pkgPath) {
			eerror.ThrowWithCode(fmt.Sprintf("file %s does not exist!", pkgPath), eerror.ExitPackageFile)
		}

		data, err := os.ReadFile(pkgPath)
		if err != nil {
			eerror.ThrowWithCode(fmt.Sprintf("file %s read failure!", pkgPath), eerror.ExitPackageFile)
		}
		err = json.Unmarshal(data, &ret)
		if err != nil {
			eerror.ThrowWithCode(fmt.Sprintf("file %s is not in json format!", pkgPath), eerror.ExitPackageFile)
		}
	}

	return ret
}
