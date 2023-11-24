package ehelper

type ResultJson struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data any    `json:"data"`
}

func GetJson() *ResultJson {
	return &ResultJson{
		Code: 0,
		Msg:  "",
		Data: nil,
	}
}
