const fs = require('fs');
const escapeStringRegexp = require('escape-string-regexp');

const SHEBANG_REGEX = /#!(.*) (.*)\n/;

const existsFile = (path) => {
  return fs.existsSync(path);
};

const readFile = (path) => {
  return fs.readFileSync(path, 'utf8');
};

const writeFile = (path, content) => {
  fs.writeFileSync(path, content);
};

const hasShebang = (content) => {
  return SHEBANG_REGEX.test(content);
};

const getShebang = (content) => {
  return SHEBANG_REGEX.exec(content)[0].replace(/\n/g, '');
};

const buildShebangLine = (interpreter) => {
  return `#!/usr/bin/env ${interpreter}`;
};

const rewriteShebang = (path) => {
  if (existsFile(path)) {
    const content = readFile(path);
    if (hasShebang(content)) {
      const shebang = getShebang(content);
      const re = new RegExp(escapeStringRegexp(shebang), 'gi');
      writeFile(path, `${shebang}\n${content.replace(re, '')}`);
    }
  }
};

const writeShebang = (path, interpreter) => {
  if (existsFile(path)) {
    const content = readFile(path);
    if (!hasShebang(content)) {
      const shebang = buildShebangLine(interpreter);
      writeFile(path, `${shebang}\n${content}`);
    }
  }
};

const newBundle = (name, path) => ({
  name,
  path,
});

const getBundles = (bundle) => {
  const { name: path, assets, childBundles } = bundle;
  const bundles = [];

  if (childBundles && childBundles.size) {
    childBundles.forEach(({ name: path, assets, type }) => {
      if (assets && assets.size && type !== 'map') {
        assets.forEach(({ name }) => {
          if (!bundles.find((b) => b.name === name)) {
            bundles.push(newBundle(name, path));
          }
        });
      }
    });
  }

  if (path && assets) {
    if (assets && assets.size) {
      assets.forEach(({ name, type }) => {
        if (!bundles.find((b) => b.name === name) && type !== 'map') {
          bundles.push(newBundle(name, path));
        }
      });
    }
  }

  return bundles;
};

module.exports = {
  existsFile,
  readFile,
  hasShebang,
  buildShebangLine,
  rewriteShebang,
  writeShebang,
  getBundles,
};
