/**
 * Shebang plugin for Parcel.
 * @author cyntl3r <damian@cyntler.com>
 */
const path = require('path');
const fs = require('fs');
const { readFile, existsFile } = require('./utils');

const CWD = process.cwd();

const validate = (obj) => {
  return (
    'interpreter' in obj &&
    typeof obj.interpreter === 'string' &&
    obj.interpreter !== '' &&
    'files' in obj &&
    Array.isArray(obj.files) &&
    obj.files.length &&
    obj.files.filter((file) => fs.existsSync(path.join(CWD, file))).length
  );
};

const loadConfigFromPackageJson = () => {
  const packageJsonPath = path.join(CWD, 'package.json');
  if (existsFile(packageJsonPath)) {
    const packageJson = JSON.parse(readFile(packageJsonPath));
    if (
      packageJson &&
      'shebang' in packageJson &&
      Array.isArray(packageJson.shebang) &&
      packageJson.shebang.length
    ) {
      return packageJson.shebang;
    }
  }

  return [];
};

const loadConfigFromShebangRc = () => {
  const shebangRcPath = path.join(CWD, '.shebangrc');
  if (existsFile(shebangRcPath)) {
    const shebangRc = JSON.parse(readFile(shebangRcPath));
    if (shebangRc && Array.isArray(shebangRc) && shebangRc.length) {
      return shebangRc;
    }
  }

  return [];
};

const toAbsolutePath = (files) => files.map((file) => path.join(CWD, file));

const getConfig = (dynamicConfig) => {
  const conf = [];

  let configData = dynamicConfig
    ? dynamicConfig
    : [...loadConfigFromPackageJson(), ...loadConfigFromShebangRc()];

  if (Array.isArray(configData) && configData.length) {
    configData
      .filter((elem) => validate(elem))
      .forEach((elem) => {
        elem.files = toAbsolutePath(elem.files);
        conf.push(elem);
      });
  }

  return conf;
};

module.exports = {
  getConfig,
};
