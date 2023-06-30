const fs = require("fs");
const path = require("path");
const icongen = require("icon-gen");

// ---> 处理参数
const args = process.argv.splice(3);
let params = {
  input: "/public/images/logo.png",
  output: "/build/icons/",
  size: "16,32,64,256,512",
  clear: false,
  imagesDir: "/public/images/",
};
try {
  const len = args.length;
  for (let i = 0; i < len; i++) {
    const arg = args[i];
    if (arg.match(/^-i/) || arg.match(/^-input/)) {
      params["input"] = args[i + 1];
      i++;
      continue;
    }
    if (arg.match(/^-o/) || arg.match(/^-output/)) {
      params["output"] = args[i + 1];
      i++;
      continue;
    }
    if (arg.match(/^-s/) || arg.match(/^-size/)) {
      params["size"] = args[i + 1];
      i++;
      continue;
    }
    if (arg.match(/^-c/) || arg.match(/^-clear/)) {
      params["clear"] = true;
      continue;
    }
    if (arg.match(/^-img/) || arg.match(/^-images/)) {
      params["imagesDir"] = args[i + 1];
      i++;
      continue;
    }
  }
} catch (e) {
  console.error("[ee-core] [tools/iconGen] args: ", args);
  console.error("[ee-core] [tools/iconGen] ERROR: ", e);
  throw new Error("参数错误!!");
}

// ---> 组装参数
console.log("[ee-core] [tools/iconGen] icon 当前路径: ", process.cwd());
const input = path.join(process.cwd(), params.input);
const output = path.join(process.cwd(), params.output);
const imagesDir = path.join(process.cwd(), params.imagesDir);
const sizeList = params.size.split(",").map((item) => parseInt(item));
const iconOptions = {
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

// 删除生成的文件(.ico .png)
const deleteGenFile = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    // 读取文件夹下的文件目录
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const curPath = path.join(dirPath, file);
      // 判断是不是文件夹，如果是，继续递归
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteGenFile(curPath);
      } else {
        // 删除文件
        if ([".ico", ".png"].includes(path.extname(curPath))) {
          fs.unlinkSync(curPath);
        }
      }
    });
  }
};

// 为生成的资源重命名 (logo-32.png -> 32x32.png)
function renameForEE(filesPath) {
  console.log("[ee-core] [tools/iconGen] iconGen 开始重新命名logo图片资源");
  try {
    const len = filesPath.length;
    for (let i = 0; i < len; i++) {
      const filePath = filesPath[i];
      const extname = path.extname(filePath);
      if ([".png"].includes(extname)) {
        const filename = path.basename(filePath, extname);
        const basename = filename.split("-")[1];
        const dirname = path.dirname(filePath);
        // 处理 tray 图标 --> 复制到 public/images 目录下
        if ("16" === basename) {
          const newName = "tray-logo" + extname;
          fs.copyFileSync(filePath, path.join(imagesDir, newName));
          console.log(`${filename}${extname} --> ${params.imagesDir}/${newName} 复制成功!`);
          fs.unlinkSync(filePath);
          continue;
        }
        // 处理 win 窗口图标 --> 复制到 public/images 目录下
        if ("32" === basename) {
          const newName = filename + extname;
          fs.copyFileSync(filePath, path.join(imagesDir, newName));
          console.log(`${filename}${extname} --> ${params.imagesDir}/${newName} 复制成功!`);
        }
        // 重命名 --> 32x32.png
        const newName = basename + "x" + basename + extname;
        const newPath = path.join(dirname, newName);
        fs.renameSync(filePath, newPath);
        console.log(`${filename}${extname} --> ${newName} 重命名成功!`);
      }
    }
    console.log("[ee-core] [tools/iconGen] iconGen 资源处理完成!");
  } catch (e) {
    console.error("[ee-core] [tools/iconGen] ERROR: ", e);
    throw new Error("重命名logo图片资源失败!!");
  }
}

// ---> 生成图标
const generateIcons = () => {
  console.log("[ee-core] [tools/iconGen] iconGen 开始处理生成logo图片");
  if (!fs.existsSync(input)) {
    console.error("[ee-core] [tools/iconGen] input: ", input);
    throw new Error("输入的图片不存在或路径错误");
  }
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  } else {
    // 清空目录
    params.clear && deleteGenFile(output);
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  icongen(input, output, iconOptions)
    .then((results) => {
      console.log("[ee-core] [tools/iconGen] iconGen 已生成下方图片资源");
      console.log(results);
      renameForEE(results);
    })
    .catch((err) => {
      console.error(err);
      throw new Error("[ee-core] [tools/iconGen] iconGen 生成失败!");
    });
};

// ---> 执行
const run = () => {
  generateIcons();
};

module.exports = {
  run,
};
