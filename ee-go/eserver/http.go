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

	Router *gin.Engine
	//Context *gin.Context
)

func CreateHttpServer() {
	gin.SetMode(gin.ReleaseMode)
	Router = gin.New()
	Router.MaxMultipartMemory = 1024 * 1024 * 64
	Router.Use(
		setCors(),
		setSession(),
		setGzip(),
	)

	loadDebug()
	loadAssets()
	loadViews()

	host := "0.0.0.0"
	// if model.Conf.System.NetworkServe {
	// 	host = "0.0.0.0"
	// } else {
	// 	host = "127.0.0.1"
	// }

	address := host + ":" + eapp.HttpPort
	ln, err := net.Listen("tcp", address)
	if nil != err {
		elog.Logger.Errorf("[ee-go] http server startup failure : %s", err)
		eerror.ThrowWithCode("", eerror.ExitListenPortErr)
	}

	url := "http://" + address
	pid := os.Getpid()
	elog.Logger.Infof("[ee-go] http server %s, pid:%d", url, pid)
	eapp.HttpServerIsRunning = true

	go run(ln)
}

func run(ln net.Listener) {
	if err := http.Serve(ln, Router); nil != err {
		elog.Logger.Errorf("[ee-go] http server startup failure: %s", err)
		eerror.ThrowWithCode("", eerror.ExitHttpStartupErr)
	}
}

// set CORS
func setCors() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("Access-Control-Allow-Origin", "*")
		ctx.Header("Access-Control-Allow-Credentials", "true")
		ctx.Header("Access-Control-Allow-Headers", "origin, Content-Length, X-Custom-Header, Content-Type, Authorization")
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS")
		ctx.Header("Access-Control-Allow-Private-Network", "true")

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
	Router.GET("/debug/pprof/", gin.WrapF(pprof.Index))
	Router.GET("/debug/pprof/cmdline", gin.WrapF(pprof.Cmdline))
	Router.GET("/debug/pprof/symbol", gin.WrapF(pprof.Symbol))
	Router.GET("/debug/pprof/trace", gin.WrapF(pprof.Trace))
	Router.GET("/debug/pprof/profile", gin.WrapF(pprof.Profile))
}

func loadViews() {
	elog.Logger.Infof("[ee-go] loadViews--------- ")
	// home page
	Router.Handle("GET", "/", func(ctx *gin.Context) {
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

		elog.Logger.Infof("[ee-go] location : %s,", location)

		ctx.Redirect(302, location.String())
	})
}

func loadAssets() {
	logo := filepath.Join(eapp.PublicDir, "images", "logo-32.png")
	elog.Logger.Infof("[ee-go] logo : %s", logo)
	Router.StaticFile("favicon.ico", filepath.Join(eapp.PublicDir, "images", "logo-32.png"))
	Router.Static("/public/", eapp.PublicDir)

	// [todo] 后续可以考虑做成多目录
	Router.Static("/app/", filepath.Join(eapp.PublicDir, "dist"))
	Router.Static("/browser/", filepath.Join(eapp.PublicDir, "dist"))
	Router.Static("/mobile/", filepath.Join(eapp.PublicDir, "dist"))
}

// get platform
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
