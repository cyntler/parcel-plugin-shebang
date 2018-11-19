/**
 * Shebang plugin for Parcel.
 * @author sintloer <contact@sintloer.com>
 */
const path = require('path');
const fs = require('fs');
const yn = require('yn');

const CWD = process.cwd();

const getShebang = () => {
  let value;
  const packageJsonPath = path.join(CWD, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if ('shebang' in packageJson && typeof packageJson.shebang === 'string') {
      value = packageJson.shebang;
    }
  }

  return `#!/usr/bin/env ${value || 'node'}`;
};

const write = (name, shebang) => {
  if (fs.existsSync(name)) {
    const content = fs.readFileSync(name, 'utf8');
    fs.writeFileSync(name, `${shebang}\n${content}`);
  }
};

const isJsFile = (filename) => {
  return filename.split('.').pop() === 'js';
};

module.exports = bundler => {
  if (
    bundler.options.target !== 'node'
    || ('PARCEL_PLUGIN_SHEBANG' in process.env && !yn(process.env.PARCEL_PLUGIN_SHEBANG))
  ) {
    return false;
  }

  bundler.on('bundled', bundle => {
    const { name, childBundles } = bundle;
    const shebang = getShebang();

    if (name && isJsFile(name)) {
      write(name, shebang);
    } else {
      childBundles.forEach(({ name }) => {
        if (isJsFile(name)) {
          write(name, shebang);
        }
      });
    }
  });

  return true;
};
