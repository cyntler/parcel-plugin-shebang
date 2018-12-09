/**
 * Shebang plugin for Parcel.
 * @author sintloer <contact@sintloer.com>
 */
const path = require('path');
const fs = require('fs');
const { isJsFile } = require('./utils');

const CWD = process.cwd();

const validate = obj => {
  return 'interpreter' in obj && typeof obj.interpreter === 'string' && obj.interpreter !== ''
    && 'files' in obj && Array.isArray(obj.files) && obj.files.length
    && (obj.files.filter(file => fs.existsSync(path.join(CWD, file)) && isJsFile(path.join(CWD, file)))).length;
};

const loadConfigFromPackageJson = () => {
  const packageJsonPath = path.join(CWD, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson && 'shebang' in packageJson && Array.isArray(packageJson.shebang) && packageJson.shebang.length) {
      return packageJson.shebang;
    }
  }

  return false;
}

const toAbsolutePath = files => files.map(file => path.join(CWD, file));

const getConfig = (dynamicConfig) => {
  const conf = [];

  const configData = dynamicConfig ? dynamicConfig : loadConfigFromPackageJson();
  if (Array.isArray(configData) && configData.length) {
    configData
      .filter(elem => validate(elem))
      .forEach(elem => {
        elem.files = toAbsolutePath(elem.files);
        conf.push(elem);
      });
  }
  
  return conf;
};

module.exports = {
  getConfig
};
