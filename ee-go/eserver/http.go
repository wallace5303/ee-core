package eserver

import (
	"fmt"
	"net"
	"net/http"
	"net/http/pprof"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
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

func CreateHttpServer(cfg map[string]any) {
	//fmt.Printf("http config: %#v\n", cfg)
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

	protocol := cfg["protocol"].(string)
	hostname := cfg["hostname"].(string)
	if cfg["network"] == true {
		hostname = "0.0.0.0"
	}
	port := eapp.HttpPort
	cfgPort := int(cfg["port"].(float64))
	if cfgPort > 0 {
		port = cfgPort
	}
	portStr := strconv.Itoa(port)

	address := hostname + ":" + portStr
	ln, err := net.Listen("tcp", address)
	if nil != err {
		elog.Logger.Errorf("[ee-go] http server startup failure : %s", err)
		eerror.ThrowWithCode("", eerror.ExitListenPortErr)
	}

	url := protocol + address
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
		ctx.Header("Access-Control-Allow-Headers", "*")
		ctx.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, UPDATE, OPTIONS")
		ctx.Header("Access-Control-Allow-Private-Network", "true")
		ctx.Header("Access-Control-Allow-Credentials", "true")

		if ctx.Request.Method == "OPTIONS" {
			ctx.Header("Access-Control-Max-Age", "3600")
			ctx.AbortWithStatus(http.StatusNoContent)
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
		Secure:   false,
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
	// static
	// fsys, _ := fs.Sub(eapp.StaticFS, "static")
	// fileServer := http.FileServer(http.FS(fsys))
	// handler := WrapStaticHandler(fileServer)
	// router.GET("/", handler)
	// router.GET("/favicon.ico", handler)
	// router.GET("/config.js", handler)
	// // 所有/assets/**开头的都是静态资源文件
	// router.GET("/assets/*file", handler)

	// home page
	Router.GET("/", func(ctx *gin.Context) {
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

	// 404
	Router.NoRoute(func(ctx *gin.Context) {
		ret := NewJson()
		ret.Code = http.StatusNotFound
		ret.Msg = fmt.Sprintf("not found '%s:%s'", ctx.Request.Method, ctx.Request.URL.Path)

		ctx.JSON(http.StatusNotFound, ret)
	})

}

func loadAssets() {

	Router.StaticFile("favicon.ico", filepath.Join(eapp.PublicDir, "images", "logo-32.png"))

	// 所有/assets/**开头的都是静态资源文件
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
