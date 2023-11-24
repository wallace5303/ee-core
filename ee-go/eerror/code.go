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
	ExitConfigStaticErr    = -14
	ExitConfigLogErr       = -15
	ExitConfigCoreLogErr   = -16
	ExitConfigHttpErr      = -17

	// log
	ExitConfigGenerate = -21

	// http
	ExitListenPortErr  = -31
	ExitHttpStartupErr = -32

	// static

)
