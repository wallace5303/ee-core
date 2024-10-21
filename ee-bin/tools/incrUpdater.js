'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto')
const chalk = require('chalk');
const Utils = require('../lib/utils');
const admZip = require('adm-zip')

/**
 * 增量升级
 * @class
 */

module.exports = {
  
  /**
   * 执行
   */  
  run(options = {}) {
    console.log('[ee-bin] [updater] Start');
    const { config, asarFile, platform } = options;
    const binCfg = Utils.loadConfig(config);
    const cfg = binCfg.updater;

    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${cfg} config does not exist`));
      return;
    }

    if (platform) {
      this.generateFile(cfg, asarFile, platform);
    } else {
      this.generateFileOld(cfg, asarFile);
    }

    console.log('[ee-bin] [updater] End');
  },

  /**
   * 生成增量升级文件
   */ 
  generateFile(config, asarFile, platform) {
    const cfg = config[platform];
    let latestVersionInfo = {}
    const homeDir = process.cwd();
    console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green(`${platform} config:`), cfg);

    let asarFilePath = "";
    if (asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, asarFile));
    } else if (Array.isArray(cfg.asarFile)) {  
      // 检查文件列表，如果存在就跳出
      for (const filep of cfg.asarFile) {
        asarFilePath = path.normalize(path.join(homeDir, filep));
        if (fs.existsSync(asarFilePath)) {
          break;
        }
      }
    } else {
      asarFilePath = path.normalize(path.join(homeDir, cfg.asarFile));
    }

    if (!fs.existsSync(asarFilePath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${asarFilePath} does not exist`));
      return;
    }

    const packageJson = Utils.getPackage();
    const version = packageJson.version;
    let platformForFilename = platform;
    if (platform.indexOf("_") !== -1) {
      const platformArr = platform.split("_");
      platformForFilename = platformArr.join("-");
    }
    
    // 生成 zip
    let zipName = "";
    zipName = path.basename(cfg.output.zip, '.zip') + `-${platformForFilename}-${version}.zip`;
    const asarZipPath = path.join(homeDir, cfg.output.directory, zipName);
    if (fs.existsSync(asarZipPath)) {
      Utils.rm(asarZipPath);
    }
    const zip = new admZip();
    // 添加 asar 文件
    zip.addLocalFile(asarFilePath); 
    // 添加 extraResources
    if (cfg.extraResources.length > 0) {
      for (const extraRes of cfg.extraResources) {
        const extraResPath = path.normalize(path.join(homeDir, extraRes));
        if (fs.existsSync(extraResPath)) {
          zip.addLocalFile(extraResPath, "extraResources");
        }
      }
    }

    zip.writeZip(asarZipPath, (err) => {
      if (err) {
        console.log(chalk.blue('[ee-bin] [updater] create zip ') + chalk.red(`Error: ${err}`));
      }
    });

    // 生成 latest.json
    const sha1 = this.generateSha1(asarFilePath);
    const date = this._getFormattedDate();
    const fileStat = fs.statSync(asarFilePath);
    const item = {
      version: version,
      file: zipName,
      size: fileStat.size,
      sha1: sha1,
      releaseDate: date,
    };
    const jsonName = path.basename(cfg.output.file, '.json') + `-${platformForFilename}.json`;
    latestVersionInfo = item;
    const updaterJsonFilePath = path.join(homeDir, cfg.output.directory, jsonName);
    Utils.writeJsonSync(updaterJsonFilePath, latestVersionInfo);

    // 删除缓存文件，防止生成的 zip 是旧版本
    if (cfg.cleanCache) {
      Utils.rm(path.join(homeDir, cfg.output.directory, 'mac'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'mac-arm64'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'win-unpacked'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'win-ia32-unpacked'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'linux-unpacked'));
    }  
  },

  /**
   * 将废弃
   */ 
  generateFileOld(cfg, asarFile) {
    var latestVersionInfo = {}
    const homeDir = process.cwd();
    console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green('config:'), cfg);

    let asarFilePath = "";
    if (asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, asarFile));
    } else if (Array.isArray(cfg.asarFile)) {  
      // 检查文件列表，如果存在就跳出
      for (const filep of cfg.asarFile) {
        asarFilePath = path.normalize(path.join(homeDir, filep));
        if (fs.existsSync(asarFilePath)) {
          break;
        }
      }
    } else {
      asarFilePath = path.normalize(path.join(homeDir, cfg.asarFile));
    }

    if (!fs.existsSync(asarFilePath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${asarFilePath} does not exist`));
      return;
    }

    const packageJson = Utils.getPackage();
    const version = packageJson.version;
    const platformForFilename = Utils.getPlatform("-");
    const platformForKey = Utils.getPlatform("_");

    // 生成 zip
    let zipName = "";
    if (cfg.output.noPlatform === true) {
      zipName = path.basename(cfg.output.zip, '.zip') + `-${version}.zip`;
    } else {
      zipName = path.basename(cfg.output.zip, '.zip') + `-${platformForFilename}-${version}.zip`;
    }
    
    const asarZipPath = path.join(homeDir, cfg.output.directory, zipName);
    if (fs.existsSync(asarZipPath) && cfg.cleanCache) {
      Utils.rm(asarZipPath);
    }
    const zip = new admZip();
    zip.addLocalFile(asarFilePath); 
    zip.writeZip(asarZipPath, (err) => {
      if (err) {
        console.log(chalk.blue('[ee-bin] [updater] create zip ') + chalk.red(`Error: ${err}`));
      }
    });

    const sha1 = this.generateSha1(asarFilePath);
    const date = this._getFormattedDate();
    const fileStat = fs.statSync(asarFilePath);

    const item = {
      version: version,
      file: zipName,
      size: fileStat.size,
      sha1: sha1,
      releaseDate: date,
    };
    let jsonName = "";
    if (cfg.output.noPlatform === true) {
      jsonName = cfg.output.file;
      latestVersionInfo = item;
    } else {
      // 生成与系统有关的文件
      jsonName = path.basename(cfg.output.file, '.json') + `-${platformForFilename}.json`;
      if (platformForKey !== "") {
        latestVersionInfo[platformForKey] = item;
      } else {
        console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${platformForFilename} is not supported`));
      }
    }

    const updaterJsonFilePath = path.join(homeDir, cfg.output.directory, jsonName);
    Utils.writeJsonSync(updaterJsonFilePath, latestVersionInfo);

    // 删除缓存文件，防止生成的 zip 是旧版本
    if (cfg.cleanCache) {
      Utils.rm(path.join(homeDir, cfg.output.directory, 'mac'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'mac-arm64'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'win-unpacked'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'linux-unpacked'));
    }  
  },
  
  generateSha1(filepath = "") {
    let sha1 = '';
    if (filepath.length == 0) {
      return sha1;
    }

    if (!fs.existsSync(filepath)) {
      return sha1;
    }

    console.log(chalk.blue('[ee-bin] [updater] ') + `generate sha1 for filepath:${filepath}`);
    try {
      const buffer = fs.readFileSync(filepath);
      const fsHash = crypto.createHash('sha1');
      fsHash.update(buffer);
      sha1 = fsHash.digest('hex');
      return sha1;

    } catch (error) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: generate sha1 error!`));
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${error}`));
    }
    return sha1;
  },

  _getFormattedDate() {
    const date = new Date(); // 获取当前日期
    const year = date.getFullYear(); // 获取年份
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 获取月份，月份从0开始计数
    const day = date.getDate().toString().padStart(2, '0'); // 获取日
  
    return `${year}-${month}-${day}`; 
  }
}