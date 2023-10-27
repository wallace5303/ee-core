package elog

import (
	"fmt"
	stdlog "log"
	"os"
	"path/filepath"

	"ee-go/eerror"

	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	LogDir  string // electron-egg logs directory
	LogName = "ee-go.log"
	zlogger *zap.Logger
	Logger  *zap.SugaredLogger
)

type LogConfig struct {
	OutputJSON bool   `json:"outputJson"`
	Level      string `json:"level"`    // Level 最低日志等级，DEBUG<INFO<WARN<ERROR<FATAL 例如：info-->收集info等级以上的日志
	FileName   string `json:"fileName"` // FileName 日志文件位置
	MaxSize    int    `json:"maxSize"`  // MaxSize 进行切割之前，日志文件的最大大小(MB为单位)，默认为100MB
	MaxAge     int    `json:"maxAge"`   // MaxAge 是根据文件名中编码的时间戳保留旧日志文件的最大天数。
}

func init() {
	dir, err := os.Getwd()
	if err != nil {
		stdlog.Printf("get current directory failed: %s", err)
		dir = "./"
	}
	LogDir = dir
}

func SetLogDir(path string) {
	LogDir = path
}

// func NewLogConfig() *LogConfig {
// 	return &LogConfig{

// 	}
// }

// Log format
func getEncoder(OutputJSON bool) (encoder zapcore.Encoder) {
	encodeConfig := zap.NewProductionEncoderConfig()

	// eg: 2022-09-01T19:11:35.921+0800
	encodeConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	// "time":"2022-09-01T19:11:35.921+0800"
	encodeConfig.TimeKey = "time"
	encodeConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	// Removes all directories except the last directory from the full path.
	encodeConfig.EncodeCaller = zapcore.ShortCallerEncoder

	encoder = zapcore.NewConsoleEncoder(encodeConfig)
	if OutputJSON {
		encoder = zapcore.NewJSONEncoder(encodeConfig)
	}
	return
}

// The location responsible for log writing
func getLogWriter(filename string, maxsize, maxAge int) (ioWS zapcore.WriteSyncer) {
	lumberJackLogger := &lumberjack.Logger{
		Filename: filename,
		MaxSize:  maxsize,
		MaxAge:   maxAge,
		Compress: false,
	}

	syncFile := zapcore.AddSync(lumberJackLogger) // Print to file
	syncConsole := zapcore.AddSync(os.Stderr)     // Print to console
	ioWS = zapcore.NewMultiWriteSyncer(syncFile, syncConsole)
	return
}

// generate Logger
func generateLogger(lCfg LogConfig) (err error) {
	writeSyncer := getLogWriter(lCfg.FileName, lCfg.MaxSize, lCfg.MaxAge)
	encoder := getEncoder(lCfg.OutputJSON)

	var l = new(zapcore.Level)
	err = l.UnmarshalText([]byte(lCfg.Level))
	if err != nil {
		return
	}

	// Create a core that writes logs to WriteSyncer.
	core := zapcore.NewCore(encoder, writeSyncer, l)
	zlogger = zap.New(core, zap.AddCaller())

	// Replace the global logger instance in the zap package, and then only use the Zap.l () call in other packages
	zap.ReplaceGlobals(zlogger)
	return
}

// [todo] 跨天情况待测试
func InitLogger(cfg interface{}) *zap.SugaredLogger {

	fmt.Printf("params cfg :%v\n", cfg)
	// log abs path
	fileFullPath := filepath.Join(LogDir, LogName)

	lc := LogConfig{
		OutputJSON: false,
		Level:      "info",
		FileName:   fileFullPath,
		MaxSize:    1024,
		MaxAge:     30,
	}

	if cfg != nil {
		logCfg, ok := cfg.(LogConfig)
		if !ok {
			eerror.Throw("CreateLogger params error !")
		}
		if logCfg.Level != "" {
			lc.Level = logCfg.Level
		}
		if logCfg.FileName != "" {
			lc.FileName = logCfg.FileName
		}
		if logCfg.MaxSize != 0 {
			lc.MaxSize = logCfg.MaxSize
		}
		if logCfg.MaxAge != 0 {
			lc.MaxAge = logCfg.MaxAge
		}
	}
	fmt.Printf("lc:%#v\n", lc)

	errInit := generateLogger(lc)
	if errInit != nil {
		errMsg := fmt.Sprintf("create logger error: %s", errInit)
		eerror.Throw(errMsg)
	}

	lg := zap.L()
	Logger = lg.Sugar()
	return Logger
}

// Get Logger
func GetLogger() *zap.SugaredLogger {
	if Logger != nil {
		return Logger
	}
	Logger := InitLogger(nil)
	return Logger
}

// // Logger Debug
// func Debug(args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	Logger.Debug(args...)
// }

// // Logger Debugf
// func Debugf(template string, args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	Logger.Debugf(template, args...)
// }

// // Logger Error
// func Error(args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	Logger.Error(args...)
// }

// // Logger Errorf
// func Errorf(template string, args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	Logger.Errorf(template, args...)
// }

// // Logger Fatal
// func Fatal(args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	Logger.Fatal(args...)
// }

// // Logger Fatalf
// func Fatalf(template string, args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	Logger.Fatalf(template, args...)
// }

// // Logger Info
// func Info(args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	Logger.Info(args...)
// }

// // Logger Infof
// func Infof(template string, args ...interface{}) {
// 	if Logger == nil {
// 		Logger = CreateLogger(nil)
// 	}
// 	return Logger.Infof
// }
