/**
 * Shebang plugin for Parcel.
 * @author sintloer <contact@sintloer.com>
 */
const yn = require('yn');
const {
  processAccordingFoundShebangs,
  processAccordingConfiguration
} = require('./process');
const { getBundles } = require('./utils');
const { getConfig } = require('./config');

module.exports = (bundler, dynamicConfig = null) => {
  if ('PARCEL_PLUGIN_SHEBANG' in process.env
    && !yn(process.env.PARCEL_PLUGIN_SHEBANG)
  ) {
    return false;
  }

  bundler.on('bundled', bundle => {
    const bundles = getBundles(bundle);
    const conf = getConfig(dynamicConfig);

    if (bundles.length) {
      processAccordingFoundShebangs(bundles);
      if (conf.length) {
        processAccordingConfiguration(bundles, conf);
      }
    }
  });

  return true;
};
