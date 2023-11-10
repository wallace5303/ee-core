package eerror

const (
	// boot
	ExitOk                    = 0
	ExitAppNameIsEmpty        = -1
	ExitCreateUserHomeConfDir = -2
	ExitCreateWorkDir         = -3
	ExitCreateDataDir         = -4
	ExitCreateLogDir          = -5
	ExitCreateTmpDir          = -6
	ExitPackageFile           = -7

	// config
	ExitConfigFile         = -11
	ExitConfigFileFS       = -12
	ExitConfigFileNotExist = -13

	// log
	ExitLogConfigErr   = -21
	ExitConfigGenerate = -22

	// http
	ExitListenPortErr  = -31
	ExitHttpStartupErr = -32
	ExitHttpConfigErr  = -33
)
