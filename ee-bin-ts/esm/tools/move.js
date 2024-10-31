import path from "path";
import fs from "fs";
import fsPro from "fs-extra";
import chalk from "chalk";
import Utils from "../lib/utils.js";
'use strict';
export const run = moduleExports.run;
export function 
/**
 * Delete a file or folder
 */
_rm(name) {
    // check
    if (!fs.existsSync(name)) {
        return;
    }
    const nodeVersion = (process.versions && process.versions.node) || null;
    if (nodeVersion && Utils.compareVersion(nodeVersion, '14.14.0') == 1) {
        fs.rmSync(name, { recursive: true });
    }
    else {
        fs.rmdirSync(name, { recursive: true });
    }
}
const moduleExports = {
    /**
     * 执行
     */
    run(options = {}) {
        console.log('[ee-bin] [move] Start moving resources');
        const homeDir = process.cwd();
        const { config, flag } = options;
        const binCfg = Utils.loadConfig(config);
        let flags;
        const flagString = flag.trim();
        if (flagString.indexOf(',') !== -1) {
            flags = flagString.split(',');
        }
        else {
            flags = [flagString];
        }
        for (let i = 0; i < flags.length; i++) {
            let f = flags[i];
            let cfg = binCfg.move[f];
            if (!cfg) {
                console.log(chalk.blue('[ee-bin] [move] ') + chalk.red(`Error: ${f} config does not exist`));
                return;
            }
            console.log(chalk.blue('[ee-bin] [move] ') + chalk.green(`Move flag: ${f}`));
            console.log(chalk.blue('[ee-bin] [move] ') + chalk.green('config:'), cfg);
            const distResource = path.join(homeDir, cfg.dist);
            if (!fs.existsSync(distResource)) {
                const errorTips = chalk.bgRed('Error') + ` ${cfg.dist} resource does not exist !`;
                console.error(errorTips);
                return;
            }
            // clear the historical resource and copy it to the ee resource directory
            const targetResource = path.join(homeDir, cfg.target);
            if (fs.statSync(distResource).isDirectory() && !fs.existsSync(targetResource)) {
                fs.mkdirSync(targetResource, { recursive: true, mode: 0o777 });
            }
            else {
                this._rm(targetResource);
                console.log('[ee-bin] [move] Clear history resources:', targetResource);
            }
            fsPro.copySync(distResource, targetResource);
            // [todo] go project, special treatment of package.json, reserved only necessary
            console.log(`[ee-bin] [move] Copy ${distResource} to ${targetResource}`);
        }
        console.log('[ee-bin] [move] End');
    },
    _rm
};
export default moduleExports;
