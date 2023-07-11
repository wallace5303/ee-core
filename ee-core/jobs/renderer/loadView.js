//require('bytenode');
const Ps = require('../../ps');

/**
  * loadView 生成BrowserWindow的html content
  */
const loadView = function (opt = {}) {
  const webSecurity = opt.webSecurity;
  const src = opt.src;
  const title = opt.title;
  const script = opt.script;

  //const scriptUrl = new URL('eefile://' + src);
  const scriptUrl = 'eefile://' + src;
  console.log('[ee-core:job] scriptUrl: ', scriptUrl);

  // 脚本内容
  //const scriptBytenode = Ps.isDev() ? '' : `<script> require('bytenode') </script>`;
  const scriptContent = webSecurity ? `<script> ${ script } </script>` : `<script src='${scriptUrl}'></script>`;

  // html内容
  const htmlContent = (`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
      </head>
      <body>
        ${scriptContent}
      </body>
    </html>
  `);

  const DataURI = 'data:text/html;charset=UTF-8,';
  const data = DataURI + encodeURIComponent(htmlContent);

  return data;
};

module.exports = loadView;