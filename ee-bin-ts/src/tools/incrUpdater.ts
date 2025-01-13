import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import chalk from 'chalk';
import * as Utils from '../lib/utils';
import admZip from 'adm-zip';

type Config = {
  asarFile?: string | string[];
  output: {
    zip: string;
    file: string;
    directory: string;
  };
  extraResources?: string[];
  cleanCache?: boolean;
};

type PlatformConfig = {
  [key: string]: any; // 使用索引签名作为示例，根据实际结构定义类型
};

class Updater {
  /**
   * 执行
   */
  static run(options: { config: string; asarFile?: string; platform: string }) {
    console.log('[ee-bin] [updater] Start');
    const { config, asarFile, platform } = options;
    const binCfg = Utils.loadConfig(config);
    const cfg: PlatformConfig = binCfg.updater;

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
  static generateFile(config: PlatformConfig, asarFile: string | undefined, platform: string) {
    const cfg = config[platform];
    let latestVersionInfo: any = {}; // 根据实际结构定义类型
    const homeDir = process.cwd();
    console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green(`${platform} config:`), cfg);

    let asarFilePath = "";
    if (asarFile) {
      asarFilePath = path.normalize(path.join(homeDir, asarFile));
    } else if (Array.isArray(cfg.asarFile)) {
      for (const filep of cfg.asarFile) {
        asarFilePath = path.normalize(path.join(homeDir, filep));
        if (fs.existsSync(asarFilePath)) {
          break;
        }
      }
    } else {
      asarFilePath = path.normalize(path.join(homeDir, cfg.asarFile as string));
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
    zip.addLocalFile(asarFilePath);
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
    Utils.writeJsonSync(updaterJsonFilePath, latestVersionInfo);

    // 删除缓存文件，防止生成的 zip 是旧版本
    if (cfg.cleanCache) {
      Utils.rm(path.join(homeDir, cfg.output.directory, 'mac'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'mac-arm64'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'win-unpacked'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'win-ia32-unpacked'));
      Utils.rm(path.join(homeDir, cfg.output.directory, 'linux-unpacked'));
    }
  }

  static generateSha1(filepath: string = ""): string {
    let sha1 = '';
    if (filepath.length === 0) {
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

  static _getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

export = Updater;