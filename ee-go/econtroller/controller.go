package econtroller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	Ctx *gin.Context
}

type Result struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func (c *Controller) ReturnJson(code int, msg string, data any) {
	ret := &Result{
		Code: 0,
		Msg:  "",
		Data: nil,
	}

	c.Ctx.JSON(http.StatusOK, ret)
}

func (c *Controller) Init(ctx *gin.Context) {
	c.Ctx = ctx
}

// Handler
func (c *Controller) HandlerFunc() bool {
	return false
}
