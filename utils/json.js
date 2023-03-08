const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

exports.strictParse = function (str) {
  const obj = JSON.parse(str);
  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON string is not object');
  }
  return obj;
};

exports.readSync = function(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath));
};

exports.writeSync = function(filepath, str, options) {
  options = options || {};
  if (!('space' in options)) {
    options.space = 2;
  }

  mkdirp.sync(path.dirname(filepath));
  if (typeof str === 'object') {
    str = JSON.stringify(str, options.replacer, options.space) + '\n';
  }

  fs.writeFileSync(filepath, str);
};

exports.read = function(filepath) {
  return fs.stat(filepath)
    .then(function(stats) {
      if (!stats.isFile()) {
        throw new Error(filepath + ' is not found');
      }
      return fs.readFile(filepath);
    })
    .then(function(buf) {
      return JSON.parse(buf);
    });
};

exports.write = function(filepath, str, options) {
  options = options || {};
  if (!('space' in options)) {
    options.space = 2;
  }

  if (typeof str === 'object') {
    str = JSON.stringify(str, options.replacer, options.space) + '\n';
  }

  return mkdir(path.dirname(filepath))
    .then(function() {
      return fs.writeFile(filepath, str);
    });
};

function mkdir(dir) {
  return new Promise(function(resolve, reject) {
    mkdirp(dir, function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
