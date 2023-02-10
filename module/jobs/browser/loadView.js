/**
  * loadView 生成可以供直接读取显示到BrowserWindow的html content
  * 
  * @param {String} title - 标题
  * @param {String} script - 脚本内容
  * @return {String}
  */
const loadView = ({ webSecurity, src, title, script, base = '.' }) => {

  /* script content  */
  const scriptContent =
    webSecurity ? `<script> ${ script } </script>` 
    : `<script src='${
        url.format({
          pathname: (path.posix.join(...(src).split(path.sep))),
          protocol: 'eefile:',
          slashes: true
        })
      }'></script>`;

  const htmlContent = (`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <base href="${base}">
        <meta charset="UTF-8">
      </head>
      <body>
        ${scriptContent}
      </body>
    </html>
  `);

  return 'data:text/html;charset=UTF-8,' + encodeURIComponent(htmlContent);
};

module.exports = loadView;