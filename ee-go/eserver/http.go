package eserver

import (
	"net"
	"net/http"
	"net/http/pprof"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"ee-go/eapp"
	"ee-go/eerror"
	"ee-go/elog"
	"ee-go/eutil"

	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/mssola/useragent"
)

var (
	// platform
	PlatformPC      = "pc"
	PlatformBrowser = "browser"
	PlatformPhone   = "phone"
	PlatformPad     = "pad"

	GinInstance *gin.Engine
)

func InitServer() {
	gin.SetMode(gin.ReleaseMode)
	GinInstance := gin.New()
	GinInstance.MaxMultipartMemory = 1024 * 1024 * 64
	GinInstance.Use(
		setCors(),
		setGzip(),
		setSession(),
	)

	loadDebug()
	loadAssets()
	loadViews()

	// router()

	host := "0.0.0.0"
	// if model.Conf.System.NetworkServe {
	// 	host = "0.0.0.0"
	// } else {
	// 	host = "127.0.0.1"
	// }

	address := host + ":" + eapp.HttpPort
	Listener, err := net.Listen("tcp", address)
	if nil != err {
		elog.Logger.Errorf("[ee-go] http service startup failure : %s", err)
		eerror.ThrowWithCode("", eerror.ExitListenPortErr)
	}

	url := "http://" + address
	pid := os.Getpid()
	elog.Logger.Infof("[ee-go] http server address : %s, pid: %s", url, pid)
	eapp.HttpServerIsRunning = true

	if err = http.Serve(Listener, GinInstance); nil != err {
		elog.Logger.Errorf("[ee-go] http service startup failure: %s", err)
		eerror.ThrowWithCode("", eerror.ExitHttpStartupErr)
	}
}

// set CORS
func setCors() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("Access-Control-Allow-Credentials", "true")
		ctx.Header("Access-Control-Allow-Headers", "origin, Content-Length, X-Custom-Header, Content-Type, Authorization")
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS")
		ctx.Header("Access-Control-Allow-Private-Network", "true")
		ctx.Header("Access-Control-Allow-Origin", "*")

		if ctx.Request.Method == "OPTIONS" {
			ctx.Header("Access-Control-Max-Age", "3600")
			ctx.AbortWithStatus(204)
			return
		}

		ctx.Next()
	}
}

// set Gzip
func setGzip() gin.HandlerFunc {
	level := gzip.DefaultCompression
	opt := gzip.WithExcludedExtensions([]string{".pdf", ".mp3", ".wav", ".ogg", ".mov", ".weba", ".mkv", ".mp4", ".webm"})
	return gzip.Gzip(level, opt)
}

// set Session
func setSession() gin.HandlerFunc {
	cookieStore := cookie.NewStore([]byte("TAM36OimHa8LDbtk"))
	cookieStore.Options(sessions.Options{
		Path:     "/",
		Secure:   eapp.Ssl,
		HttpOnly: true,
	})

	return sessions.Sessions(eapp.AppName, cookieStore)
}

func loadDebug() {
	GinInstance.GET("/debug/pprof/", gin.WrapF(pprof.Index))
	GinInstance.GET("/debug/pprof/cmdline", gin.WrapF(pprof.Cmdline))
	GinInstance.GET("/debug/pprof/symbol", gin.WrapF(pprof.Symbol))
	GinInstance.GET("/debug/pprof/trace", gin.WrapF(pprof.Trace))
	GinInstance.GET("/debug/pprof/profile", gin.WrapF(pprof.Profile))
}

func loadViews() {
	// home page
	GinInstance.Handle("GET", "/", func(ctx *gin.Context) {
		location := url.URL{}

		if GetPlatform(ctx) == PlatformPC {
			location.Path = "/app/"
		} else if GetPlatform(ctx) == PlatformBrowser {
			location.Path = "/browser/"
		} else {
			location.Path = "/mobile/"
		}

		// append random string
		queryParams := ctx.Request.URL.Query()
		queryParams.Set("f", eutil.GetRandomString(8))
		location.RawQuery = queryParams.Encode()

		ctx.Redirect(302, location.String())
	})
}

func loadAssets() {
	GinInstance.StaticFile("favicon.ico", filepath.Join(eapp.PublicDir, "stage", "logo-32.png"))
	GinInstance.Static("/public/", eapp.PublicDir)

	// [todo] 后续可以考虑做成多目录
	GinInstance.Static("/app/", filepath.Join(eapp.PublicDir, "dist"))
	GinInstance.Static("/browser/", filepath.Join(eapp.PublicDir, "dist"))
	GinInstance.Static("/mobile/", filepath.Join(eapp.PublicDir, "dist"))
}

func GetPlatform(ctx *gin.Context) string {
	userAgent := ctx.GetHeader("User-Agent")

	if strings.Contains(userAgent, "Electron") {
		return PlatformPC
	} else if strings.Contains(userAgent, "Pad") ||
		(strings.ContainsAny(userAgent, "Android") && !strings.Contains(userAgent, "Mobile")) {
		return PlatformBrowser
	} else {
		if idx := strings.Index(userAgent, "Mozilla/"); 0 < idx {
			userAgent = userAgent[idx:]
		}
		ua := useragent.New(userAgent)
		if ua.Mobile() {
			return PlatformPhone
		} else {
			return PlatformBrowser
		}
	}
}

// func router(GinInstance *gin.Engine) {
// 	GinInstance.Handle("GET", "/api/system/bootProgress", bootProgress)
// }

// func rewritePortJSON(pid, port string) {
// 	portJSON := filepath.Join(util.HomeDir, ".config", "siyuan", "port.json")
// 	pidPorts := map[string]string{}
// 	var data []byte
// 	var err error

// 	if gulu.File.IsExist(portJSON) {
// 		data, err = os.ReadFile(portJSON)
// 		if nil != err {
// 			logging.LogWarnf("read port.json failed: %s", err)
// 		} else {
// 			if err = gulu.JSON.UnmarshalJSON(data, &pidPorts); nil != err {
// 				logging.LogWarnf("unmarshal port.json failed: %s", err)
// 			}
// 		}
// 	}

// 	pidPorts[pid] = port
// 	if data, err = gulu.JSON.MarshalIndentJSON(pidPorts, "", "  "); nil != err {
// 		logging.LogWarnf("marshal port.json failed: %s", err)
// 	} else {
// 		if err = os.WriteFile(portJSON, data, 0644); nil != err {
// 			logging.LogWarnf("write port.json failed: %s", err)
// 		}
// 	}
// }

// port is open
func isPortOpen(port string) bool {
	timeout := time.Second
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", port), timeout)
	if nil != err {
		return false
	}
	if nil != conn {
		conn.Close()
		return true
	}
	return false
}
