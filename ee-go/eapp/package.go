package eapp

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"ee-go/eerror"
	"ee-go/eutil"
)

type Package struct {
	Name        string `json:"name"`        // app name
	Version     string `json:"version"`     // app version
	Description string `json:"description"` // description
	Main        string `json:"main"`        // electron main file
	Repository  string `json:"repository"`  // project repository
	Author      string `json:"author"`      // author
	License     string `json:"license"`     // project license
}

func NewPackage() *Package {
	return &Package{
		Name:        "",
		Version:     "",
		Description: "",
		Main:        "",
		Repository:  "",
		Author:      "",
		License:     "",
	}
}

// get electron package.json
func ReadPackage() (ret *Package) {
	ret = NewPackage()

	pkgPath := filepath.Join(HomeDir, "package.json")
	if !eutil.FileIsExist(pkgPath) {
		eerror.ThrowWithCode(fmt.Sprintf("Electon %s does not exist!", pkgPath), eerror.ExitPackageFile)
		return
	}

	data, err := os.ReadFile(pkgPath)
	if err != nil {
		eerror.ThrowWithCode(fmt.Sprintf("file %s read failure!", pkgPath), eerror.ExitPackageFile)
		return
	}
	err = json.Unmarshal(data, ret)
	if err != nil {
		eerror.ThrowWithCode(fmt.Sprintf("file %s is not in json format!", pkgPath), eerror.ExitPackageFile)
		return
	}
	return
}
