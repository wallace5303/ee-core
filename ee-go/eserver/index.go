package eserver

func Init(serve string) {
	switch serve {
	case "http":
		CreateHttpServer()
	case "websocket":
		//
	default:
		//
	}
}
