import fs from 'fs';
import path from 'path';

interface IconOptions {
  report: boolean;
  ico: {
    name: string;
    sizes: number[];
  };
  favicon: {
    name: string;
    pngSizes: number[];
  };
}

interface Params {
  input: string;
  output: string;
  size: string;
  clear: boolean;
  imagesDir: string;
}

class IconGen {
  private params: Params;
  private input: string;
  private output: string;
  private imagesDir: string;
  private iconOptions: IconOptions;

  constructor() {
    this._init();
  }

  _init(): void {
    const args = process.argv.slice(3);
    this.params = {
      input: "/public/images/logo.png",
      output: "/build/icons/",
      size: "16,32,64,256,512",
      clear: false,
      imagesDir: "/public/images/",
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.match(/^-i/) || arg.match(/^-input/)) {
        this.params.input = args[i + 1];
        i++;
        continue;
      }
      if (arg.match(/^-o/) || arg.match(/^-output/)) {
        this.params.output = args[i + 1];
        i++;
        continue;
      }
      if (arg.match(/^-s/) || arg.match(/^-size/)) {
        this.params.size = args[i + 1];
        i++;
        continue;
      }
      if (arg.match(/^-c/) || arg.match(/^-clear/)) {
        this.params.clear = true;
        continue;
      }
      if (arg.match(/^-img/) || arg.match(/^-images/)) {
        this.params.imagesDir = args[i + 1];
        i++;
        continue;
      }
    }

    this.input = path.join(process.cwd(), this.params.input);
    this.output = path.join(process.cwd(), this.params.output);
    this.imagesDir = path.join(process.cwd(), this.params.imagesDir);

    const sizeList = this.params.size.split(",").map((item) => parseInt(item));
    this.iconOptions = {
      report: false,
      ico: {
        name: "icon",
        sizes: [256],
      },
      favicon: {
        name: "logo-",
        pngSizes: sizeList,
      },
    };
  }

  generateIcons(): void {
    console.log("[ee-bin] [icon-gen] iconGen 开始处理生成logo图片");
    if (!fs.existsSync(this.input)) {
      console.error("[ee-bin] [icon-gen] input: ", this.input);
      throw new Error("输入的图片不存在或路径错误");
    }
    if (!fs.existsSync(this.output)) {
      fs.mkdirSync(this.output, { recursive: true });
    } else {
      if (this.params.clear) this.deleteGenFile(this.output);
    }
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
    const icongen = require("icon-gen");
    icongen(this.input, this.output, this.iconOptions)
      .then((results) => {
        console.log("[ee-bin] [icon-gen] iconGen 已生成下方图片资源");
        console.log(results);
        this._renameForEE(results);
      })
      .catch((err) => {
        console.error(err);
        throw new Error("[ee-bin] [icon-gen] iconGen 生成失败!");
      });
  }

  deleteGenFile(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteGenFile(curPath);
        } else {
          if ([".ico", ".png"].includes(path.extname(curPath))) {
            fs.unlinkSync(curPath);
          }
        }
      });
    }
  }

  _renameForEE(filesPath: string[]): void {
    console.log("[ee-bin] [icon-gen] iconGen 开始重新命名logo图片资源");
    try {
      for (let i = 0; i < filesPath.length; i++) {
        const filePath = filesPath[i];
        const extname = path.extname(filePath);
        if ([".png"].includes(extname)) {
          const filename = path.basename(filePath, extname);
          const basename = filename.split("-")[1];
          const dirname = path.dirname(filePath);
          if ("16" === basename) {
            const newName = "tray" + extname;
            fs.copyFileSync(filePath, path.join(this.imagesDir, newName));
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} 复制成功!`);
            fs.unlinkSync(filePath);
            continue;
          }
          if ("32" === basename) {
            const newName = filename + extname;
            fs.copyFileSync(filePath, path.join(this.imagesDir, newName));
            console.log(`${filename}${extname} --> ${this.params.imagesDir}/${newName} 复制成功!`);
          }
          const newName = basename + "x" + basename + extname;
          const newPath = path.join(dirname, newName);
          fs.renameSync(filePath, newPath);
          console.log(`${filename}${extname} --> ${newName} 重命名成功!`);
        }
      }
      console.log("[ee-bin] [icon-gen] iconGen 资源处理完成!");
    } catch (e) {
      console.error("[ee-bin] [icon-gen] ERROR: ", e);
      throw new Error("重命名logo图片资源失败!!");
    }
  }
}

const run = (): void => {
  const i = new IconGen();
  i.generateIcons();
}

export const IconGenModule = {
  run,
};