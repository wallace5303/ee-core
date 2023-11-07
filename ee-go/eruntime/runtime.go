package eruntime

import (
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"ee-go/eapp"
	"ee-go/elog"
)

var (
	exitLock = sync.Mutex{}
)

func Init() {
	sigCh := make(chan os.Signal)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	sig := <-sigCh

	elog.Logger.Infof("received signal: %s", sig)
	Close()
}

// Close process
func Close() (exitCode int) {
	exitLock.Lock()
	defer exitLock.Unlock()
	eapp.IsExiting = true
	elog.Logger.Infof("ee-go is exiting...")

	// [todo] wait other
	go func() {
		time.Sleep(3000 * time.Millisecond)
		eapp.IsExiting = false
		elog.Logger.Infof("ee-go process has exited!")
		os.Exit(0)
	}()
	return
}
