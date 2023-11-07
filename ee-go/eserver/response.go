package eserver

type (
	eResult byte
)

var (
	Response eResult
)

type ResultJson struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func ReturnJson(code int, msg string, data any) *ResultJson {
	ret := &ResultJson{
		Code: code,
		Msg:  msg,
		Data: data,
	}

	return ret
}

func NewJson() *ResultJson {
	return &ResultJson{
		Code: 0,
		Msg:  "",
		Data: nil,
	}
}
