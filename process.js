const { rewriteShebang, writeShebang } = require('./utils');

const processAccordingFoundShebangs = (bundles) => {
  bundles.forEach(({ path }) => rewriteShebang(path));
};

const processAccordingConfiguration = (bundles, conf) => {
  conf.forEach((elem) => {
    const { interpreter, files } = elem;
    files.forEach((file) => {
      const bundle = bundles.find(({ name }) => name === file);
      if (bundle) {
        const { path } = bundle;
        writeShebang(path, interpreter);
      }
    });
  });
};

module.exports = {
  processAccordingFoundShebangs,
  processAccordingConfiguration,
};
