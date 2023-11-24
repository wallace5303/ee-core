package router

import (
	"net/http"
	"time"

	"ee-go/elog"

	"github.com/gin-gonic/gin"
)

// 处理函数
type HandlerFunc func(*Ctx)

type Ctx struct {
	GinCtx *gin.Context // gin context
	Err    any          // 请求错误
	Timed  int64        // 执行时间
}

var (
	// gin
	GinRouter *gin.Engine
)

func SetGinRouter(router *gin.Engine) {
	GinRouter = router
}

func Handle(httpMethod, path string, handler HandlerFunc) {
	GinRouter.Handle(httpMethod, path, func(gc *gin.Context) {
		ctx := &Ctx{GinCtx: gc}
		begin := time.Now()
		defer func() {
			ctx.Timed = time.Since(begin).Milliseconds()
			if err := recover(); err != nil {
				ctx.Err = err
			}
			// 增加开关
			elog.Logger.Infof("execution time:%d", ctx.Timed)
		}()
		handler(ctx)
	})
}

func (c *Ctx) JSON(data any) {
	c.GinCtx.JSON(http.StatusOK, data)
}

func (c *Ctx) JSONWithCode(code int, data any) {
	c.GinCtx.JSON(code, data)
}
