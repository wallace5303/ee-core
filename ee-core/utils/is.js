'use strict';

const { gt, lt } = require('semver');
const { release } = require('os');

// Checks if we are in renderer process
function renderer () {
  return process.type === 'renderer'
}

// Checks if we are in main process
function main() {
  return process.type === 'browser'
}

// Checks if we are under Mac OS
function osx() {
  return process.platform === 'darwin'
}

// Checks if we are under Mac OS
function macOS() {
  return osx()
}

// Checks if we are under Windows OS
function windows() {
  return process.platform === 'win32'
}

// Checks if we are under Linux OS
function linux() {
  return process.platform === 'linux'
}

// Checks if we are the processor's arch is x86
function x86() {
  return process.arch === 'ia32'
}

// Checks if we are the processor's arch is x64
function x64() {
  return process.arch === 'x64'
}

// Checks if the app is running in a sandbox on macOS
function sandbox() {
  return 'APP_SANDBOX_CONTAINER_ID' in process.env
}

// Checks if the app is running as a Mac App Store build
function mas() {
  return process.mas === true
}

// Checks if the app is running as a Windows Store (appx) build
function windowsStore() {
  return process.windowsStore === true
}

// checks if all the 'is functions' passed as arguments are true
function all() {
  const isFunctions = new Array(arguments.length)
  for (var i = 0; i < isFunctions.length; i++) {
    isFunctions[i] = arguments[i]
  }
  if (!isFunctions.length) return
  for (i = 0; i < isFunctions.length; i++) {
    if (!isFunctions[i]()) return false
  }
  return true
}

// checks if all the 'is functions' passed as arguments are false
function none() {
  const isFunctions = new Array(arguments.length)
  for (var i = 0; i < isFunctions.length; i++) {
    isFunctions[i] = arguments[i]
  }
  if (!isFunctions.length) return
  for (i = 0; i < isFunctions.length; i++) {
    if (isFunctions[i]()) return false
  }
  return true
}

// returns true if one of the 'is functions' passed as argument is true
function one() {
  const isFunctions = new Array(arguments.length)
  for (var i = 0; i < isFunctions.length; i++) {
    isFunctions[i] = arguments[i]
  }
  if (!isFunctions.length) return
  for (i = 0; i < isFunctions.length; i++) {
    if (isFunctions[i]()) return true
  }
  return false
}

// checks the if the given release is the same of the OS
function release(requested) {
  if (osx()) {
    return requested === _osxRelease()
  } else if (windows()) {
    requested = requested.split('.')
    const actual = release().split('.')
    if (requested.length === 2) {
      return `${actual[0]}.${actual[1]}` === `${requested[0]}.${requested[1]}`
    }
    return `${actual[0]}.${actual[1]}.${actual[2]}` === `${requested[0]}.${requested[1]}.${requested[2]}`
  } else {
    // Not implemented for Linux yet
    return null
  }
}

// checks if the given release is greater than the current OS release
function gtRelease(requested) {
  if (osx()) {
    return gt(requested, _osxRelease())
  } else if (windows()) {
    requested = requested.split('.')
    const actual = release().split('.')
    if (requested.length === 2) {
      return gt(`${requested[0]}.${requested[1]}.0`, `${actual[0]}.${actual[1]}.0`)
    }
    return gt(`${requested[0]}.${requested[1]}.${requested[2]}`, `${actual[0]}.${actual[1]}.${actual[2]}`)
  } else {
    // Not implemented for Linux yet
    return null
  }
}

// checks if the given release is less than the current OS release
function ltRelease(requested) {
  if (osx()) {
    return lt(requested, _osxRelease())
  } else if (windows()) {
    requested = requested.split('.')
    const actual = release().split('.')
    if (requested.length === 2) {
      return lt(`${requested[0]}.${requested[1]}.0`, `${actual[0]}.${actual[1]}.0`)
    }
    return lt(`${requested[0]}.${requested[1]}.${requested[2]}`, `${actual[0]}.${actual[1]}.${actual[2]}`)
  } else {
    // Not implemented for Linux yet
    return null
  }
}

// returns the current osx release
function _osxRelease () {
  const actual = release().split('.')
  return `10.${actual[0] - 4}.${actual[1]}`
}

module.exports = {
  renderer,
  main,
  osx,
  macOS,
  windows,
  linux,
  x86,
  x64,
  sandbox,
  mas,
  windowsStore,
  all,
  none,
  one,
  release,
  gtRelease,
  ltRelease,
};