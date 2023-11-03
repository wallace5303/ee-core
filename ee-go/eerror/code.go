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
	ExitConfigDefaultFile = -11
	ExitConfigDevFile     = -12
	ExitConfigProdFile    = -13

	// log
	ExitConfigParams   = -21
	ExitConfigGenerate = -22

	// http
	ExitListenPortErr  = -31
	ExitHttpStartupErr = -32
)
