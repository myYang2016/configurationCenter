const { copyFile, mkdir } = require('fs/promises');
const path = require('path');
const glob = require('glob');
glob(path.resolve(__dirname, './src/page/*.html'), (err, result) => {
  mkdir(path.resolve(__dirname, './dist/page'));
  result.forEach((file) => {
    const mat = file.match(/\/page\/.*\.html$/);
    if (!mat) {
      return;
    }
    copyFile(
      file,
      path.resolve(__dirname, `./dist${mat[0]}`),
    );
  });
});
