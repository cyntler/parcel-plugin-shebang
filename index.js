/**
 * Shebang plugin for Parcel.
 * @author sintloer <contact@sintloer.com>
 */
const yn = require('yn');
const { getConfig } = require('./config');
const { write, getBundles } = require('./utils');

module.exports = (bundler, dynamicConfig = null) => {
  const conf = getConfig(dynamicConfig);

  if (('PARCEL_PLUGIN_SHEBANG' in process.env && !yn(process.env.PARCEL_PLUGIN_SHEBANG))
    || !conf.length
  ) {
    return false;
  }

  bundler.on('bundled', bundle => {
    const bundles = getBundles(bundle);
    conf.forEach(elem => {
      const { interpreter, files } = elem;
      files.forEach(file => {
        const bundle = bundles.find(({ name }) => name === file);
        if (bundle) {
          const { path } = bundle;
          write(path, interpreter);
        }
      });
    });
  });

  return true;
};
