package eapp

import (
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"ee-go/elog"
	"ee-go/eruntime"
)

var (
	exitLock = sync.Mutex{}
)

func Run() {
	sigCh := make(chan os.Signal)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	sig := <-sigCh

	elog.CoreLogger.Infof("[ee-go] received signal: %s", sig)
	Close()
}

// Close process
func Close() {
	exitLock.Lock()
	defer exitLock.Unlock()
	eruntime.IsExiting = true
	elog.CoreLogger.Infof("[ee-go] process is exiting...")

	// [todo] wait other
	go func() {
		time.Sleep(500 * time.Millisecond)
		eruntime.IsExiting = false
		elog.CoreLogger.Infof("[ee-go] process has exited!")
		os.Exit(0)
	}()
}
