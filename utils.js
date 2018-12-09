/**
 * Shebang plugin for Parcel.
 * @author sintloer <contact@sintloer.com>
 */
const fs = require('fs');

const write = (path, interpreter) => {
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const shebang = getShebang(interpreter);
    if (!content.includes((shebang.split(' '))[0])) {
      fs.writeFileSync(path, `${shebang}\n${content}`);
    }
  }
};

const isJsFile = filename => {
  return filename.split('.').pop() === 'js';
};

const getShebang = interpreter => {
  return `#!/usr/bin/env ${interpreter}`;
};

const getBundles = bundle => {
  const { name: path, assets, childBundles } = bundle;
  const bundles = [];

  if (childBundles && childBundles.size) {
    childBundles.forEach(({ name: path, assets }) => {
      if (assets && assets.size) {
        assets.forEach(({ name }) => bundles.push(newBundle(name, path)));
      }
    });
  } else if (name && assets) {
    if (assets && assets.size) {
      assets.forEach(({ name }) => bundles.push(newBundle(name, path)));
    }
  }

  return bundles;
};

const newBundle = (name, path) => {
  return {
    name,
    path
  };
};

module.exports = {
  write,
  isJsFile,
  getBundles,
  getShebang
};
