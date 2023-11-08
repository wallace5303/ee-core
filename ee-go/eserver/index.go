package eserver

func Init(serve string, cfg map[string]any) {
	switch serve {
	case "http":
		CreateHttpServer(cfg)
	case "websocket":
		//
	default:
		//
	}
}
