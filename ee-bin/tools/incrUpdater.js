'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const crypto = require('crypto');
const chalk = require('chalk');
const admZip = require('adm-zip');
const globby = require('globby');
const yaml = require('js-yaml');
const { loadConfig, writeJsonSync } = require('../lib/utils');
const { extend } = require('../lib/extend');

/**
 * Updater
 * @class
 */

class IncrUpdater {

  constructor() {
    this.tmpAppDirs = [
      'mac',
      'mac-arm64',
      'win-unpacked',
      'win-ia32-unpacked',
      'linux-unpacked'
    ];
    this.nodeModulesString = 'node_modules';
    this.asarUnpackedString = 'app.asar.unpacked';
  }

  /**
   * run
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
   * generate json file
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

    const metadataPath = path.join(homeDir, cfg.metadata);
    if (!fs.existsSync(metadataPath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${metadataPath} does not exist!`));
      return;
    }    
    const metadataObj = yaml.load(fs.readFileSync(metadataPath, 'utf8')); 

    let asarFilePath = "";
    if (asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, asarFile));
    } else {
      asarFilePath = path.normalize(path.join(homeDir, cfg.asarFile));
    }

    if (!fs.existsSync(asarFilePath)) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${asarFilePath} does not exist`));
      return;
    }

    const version = metadataObj.version;
    let platformForFilename = platform;
    if (platform.indexOf("_") !== -1) {
      const platformArr = platform.split("_");
      platformForFilename = platformArr.join("-");
    }
    
    // zip
    let zipName = "";
    zipName = path.basename(cfg.output.zip, '.zip') + `-${platformForFilename}-${version}.zip`;
    const asarZipPath = path.join(homeDir, cfg.output.directory, zipName);
    if (fs.existsSync(asarZipPath)) {
      fsPro.removeSync(asarZipPath);
    }
    const zip = new admZip();
    // add asar
    zip.addLocalFile(asarFilePath); 
    // add extraResources
    if (cfg.extraResources && cfg.extraResources.length > 0) {
      const files = globby.sync(cfg.extraResources, { cwd: homeDir });
      for (const extraRes of files) {
        const extraResPath = path.normalize(path.join(homeDir, extraRes));
        if (!fs.existsSync(extraResPath)) {
          continue;
        }
        const extraResDir = path.dirname(extraResPath);
        const index = extraResDir.indexOf('extraResources');
        const zipFileDir = extraResDir.substring(index);
        // 资源路径 extraResPath: D:\www\gofile\src\ee\ee-demo\build\extraResources\hello\c.txt
        // 文件在zip中的路径 zipFileDir: extraResources/hello
        zip.addLocalFile(extraResPath, zipFileDir);
      }
    }
    // add asarUnpacked
    if (cfg.asarUnpacked && cfg.asarUnpacked.length > 0) {
      const modules = cfg.asarUnpacked;
      for (const moduleItem of modules) {
        const modulePath = path.normalize(path.join(homeDir, moduleItem));
        if (!fs.existsSync(modulePath)) {
          throw new Error(`${modulePath} is not exists!`);
        }
      
        const zipDir = path.join(this.asarUnpackedString, moduleItem);
        // console.log('modulePath', modulePath);
        // console.log('zipDir', zipDir);
        zip.addLocalFolder(modulePath, zipDir);
      }
    }

    zip.writeZip(asarZipPath, (err) => {
      if (err) {
        console.log(chalk.blue('[ee-bin] [updater] create zip ') + chalk.red(`Error: ${err}`));
      }
    });

    // generate latest.json
    // incr file
    const zipSha1 = this.generateHash(asarZipPath, 'sha1', 'hex');
    const fileStat = fs.statSync(asarZipPath);
    // full file
    const fullFileInfo = metadataObj.files[0];
    const fullFileName = fullFileInfo.url;
    const fullFilePath = path.normalize(path.join(homeDir, cfg.output.directory, fullFileName));
    const generateSha512 = this.generateHash(fullFilePath, 'sha512');
    if (fullFileInfo.sha512 != generateSha512) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: metadata sha512 is not equal to generateSha512 !
      at metadata sha512: ${fullFileInfo.sha512}
      at generate Sha512: ${generateSha512}`));
      return;
    }
    const item = {
      version: version,
      file: zipName,
      size: fileStat.size,
      sha1: zipSha1,
      fullFile: {
        fileName: fullFileName,
        size: fullFileInfo.size,
        sha512: generateSha512,
      },
      releaseDate: metadataObj.releaseDate,
    };
    const extJson = '.json';
    const jsonName = path.basename(cfg.output.file, extJson) + `-${platformForFilename}${extJson}`;
    latestVersionInfo = item;
    const updaterJsonFilePath = path.join(homeDir, cfg.output.directory, jsonName);
    writeJsonSync(updaterJsonFilePath, latestVersionInfo);

    // Delete cache files to prevent generated zip files from being outdated versions
    if (cfg.cleanCache) {
      this.tmpAppDirs.forEach(dir => {
        const dirPath = path.join(homeDir, cfg.output.directory, dir);
        fsPro.removeSync(dirPath);
      });
    }  
  }
  
  generateHash(filepath = "", algorithm = "sha512", encoding = "base64") {
    let data = '';
    if (filepath.length == 0) {
      return data;
    }

    if (!fs.existsSync(filepath)) {
      return data;
    }

    console.log(chalk.blue('[ee-bin] [updater] ') + `generate ${algorithm} for filepath:${filepath}`);
    try {
      const buffer = fs.readFileSync(filepath);
      const fsHash = crypto.createHash(algorithm);
      fsHash.update(buffer);
      data = fsHash.digest(encoding);
      return data;
    } catch (error) {
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: generate ${algorithm} error!`));
      console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${error}`));
    }
    return data;
  }

  _getFormattedDate() {
    const date = new Date(); 
    const year = date.getFullYear(); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`; 
  }  
}

module.exports = {
  IncrUpdater,
  incrUpdater: new IncrUpdater()
}