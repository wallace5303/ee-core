/**
 * ee-bin 配置
 * 仅适用于开发环境
 */
module.exports = {
  /**
   * development serve ("frontend" "electron" )
   * ee-bin dev
   */
  dev: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'dev'],
      protocol: 'http://',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'index.html',
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local'],
      loadingPage: '/public/html/loading.html',
    },
  },

  /**
   * 构建
   * ee-bin build
   */
  build: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    },
    electron: {
      bundler: 'esbuild',
      language: 'javascript',
      javascript: {
        entryPoints: ['./electron/**/*.js'],
        platform: 'node',
        bundle: false,
        minify: true,
        outdir: 'runtime',
        packages: 'external',
      },
      typescript: {
        entryPoints: ['./electron/**/*.ts'],
        tsconfig: './tsconfig.json',
        platform: 'node',
        format: 'cjs',
        bundle: false,
        minify: true,
        outdir: 'runtime',
        packages: 'external',
      },
      // javascript: {
      //   directory: './',
      //   cmd: 'esbuild',
      //   args: ['./electron/**/*.js', '--platform=node', '--minify', '--outdir=runtime', '--watch', '--packages=external']
      // },
      // typescript: {
      //   directory: './',
      //   cmd: 'esbuild',
      //   args: ['./electronts/**/*.ts', '--platform=node', '--minify', '--format=cjs', '--outdir=runtime', '--tsconfig=./electronts/tsconfig.json', '--packages=external'],
      // }
    }
  },

  /**
   * 移动资源
   * ee-bin move 
   */
  move: {
    frontend_dist: {
      src: './frontend/dist',
      dest: './public/dist'
    }
  },  

  /**
   * 预发布模式（prod）
   * ee-bin start
   */
  start: {
    directory: './',
    cmd: 'electron',
    args: ['.', '--env=prod']
  },

  /**
   * 加密
   */  
  encrypt: {
    type: 'none',
    files: [
      'electron/**/*.(js|json)',
    ],
    fileExt: ['.js'],
    cleanFiles: ['./public/electron'],
    specificFiles: ['electron/preload/bridge.js'],
    confusionOptions: {
      compact: true,      
      stringArray: true,
      stringArrayEncoding: ['none'],
      deadCodeInjection: false,
    }
  },

  /**
   * 执行自定义命令
   * ee-bin exec
   */
  exec: {},  
};