'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto')
const chalk = require('chalk');
const { loadConfig, rm, getPackage, writeJsonSync } = require('../lib/utils');
const admZip = require('adm-zip')

/**
 * 增量升级
 * @class
 */

class IncrUpdater {

  /**
   * 执行
   */  
  run(options = {}) {
    console.log('[ee-bin] [updater] Start');
    const { config, asarFile, platform } = options;
    const binCfg = loadConfig(config);
    const cfg = binCfg.updater;

    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${cfg} config does not exist`));
      return;
    }

    this.generateFile(cfg, asarFile, platform);

    console.log('[ee-bin] [updater] End');
  }

  /**
   * 生成增量升级文件
   */ 
  generateFile(config, asarFile, platform) {
    const cfg = config[platform];
    if (!cfg) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${platform} config does not exist`));
      return;
    }

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

    const packageJson = getPackage();
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
      rm(asarZipPath);
    }
    const zip = new admZip();
    // 添加 asar 文件
    zip.addLocalFile(asarFilePath); 
    // 添加 extraResources
    if (cfg.extraResources && cfg.extraResources.length > 0) {
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
    writeJsonSync(updaterJsonFilePath, latestVersionInfo);

    // 删除缓存文件，防止生成的 zip 是旧版本
    if (cfg.cleanCache) {
      rm(path.join(homeDir, cfg.output.directory, 'mac'));
      rm(path.join(homeDir, cfg.output.directory, 'mac-arm64'));
      rm(path.join(homeDir, cfg.output.directory, 'win-unpacked'));
      rm(path.join(homeDir, cfg.output.directory, 'win-ia32-unpacked'));
      rm(path.join(homeDir, cfg.output.directory, 'linux-unpacked'));
    }  
  }
  
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
  }

  _getFormattedDate() {
    const date = new Date(); // 获取当前日期
    const year = date.getFullYear(); // 获取年份
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 获取月份，月份从0开始计数
    const day = date.getDate().toString().padStart(2, '0'); // 获取日
  
    return `${year}-${month}-${day}`; 
  }  
}

module.exports = {
  IncrUpdater,
  incrUpdater: new IncrUpdater()
}