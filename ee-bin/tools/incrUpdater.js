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
        const {config, asarFile} = options;
        const binCfg = Utils.loadConfig(config);
        const cfg = binCfg.updater;

        if (!cfg) {
            console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: ${cfg} config does not exist`));
            return;
        }
        console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green('config:'), cfg);

        this.generateFile(cfg, asarFile);

        console.log('[ee-bin] [updater] End');
    },

    generateFile(cfg, asarFile) {
        //如果cfg.enables不存在,那么默认为true, 这样就不影响之前版本的配置
        if (!cfg.enables) {
            cfg.enables = {}
            //判断是否存在asarFile和extraResources
            if (cfg.asarFile) {
                cfg.enables.asarFile = true;
            }
            if (cfg.extraResources) {
                cfg.enables.extraResources = true;
            }
        }
        if (cfg.enables.asarFile === false && cfg.enables.extraResources === false) {
            console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: asarFile and extraResources are not enabled`));
            return;
        }

        var latestVersionInfo = {}
        const homeDir = process.cwd();

        // 找到打包的app.asar文件
        let asarFilePath = "";
        if (cfg.enables.asarFile === true) {
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
        }
        //找到扩展资源文件
        let extraResources = [];
        if (cfg.enables.extraResources === true) {
            let files = [];
            //获取当前系统的环境
            if (Utils.isWindows()){
                files = cfg.extraResources.windows?cfg.extraResources.windows:[];
            } else if (Utils.isMacOS()) {
                files = cfg.extraResources.macos?cfg.extraResources.macos:[];
            }else {
                files = cfg.extraResources.linux?cfg.extraResources.linux:[];
            }
            console.log(chalk.blue('[ee-bin] [updater] ') + chalk.green('extraResources:'), files);
            if (files.length > 0) {
                //判断每个文件是否都存在,如果不存在就跳过这个
                for (const filep of files) {
                    let extraFilePath = path.normalize(path.join(homeDir, filep));
                    if (fs.existsSync(extraFilePath)) {
                        extraResources.push(extraFilePath);
                    }
                }
            }else{
                console.log(chalk.blue('[ee-bin] [updater] ') + chalk.red(`Error: extraResources does not exist`));
                return
            }
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
        // 删除缓存文件，防止生成的 zip 是旧版本
        if (fs.existsSync(asarZipPath) && cfg.cleanCache) {
            Utils.rm(asarZipPath);
        }
        const zip = new admZip();
        if (cfg.enables.asarFile === true) {
            //添加源码
            zip.addLocalFile(asarFilePath);
        }

        if (cfg.enables.extraResources === true) {
            //添加扩展资源
            for (const extraFile of extraResources) {
                zip.addLocalFile(extraFile, "extraResources");
            }
        }
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