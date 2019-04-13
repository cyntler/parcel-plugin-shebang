/**
 * Shebang plugin for Parcel.
 * @author cyntl3r <damian@cyntler.com>
 */
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const Bundler = require('parcel-bundler');
const shebangPlugin = require('./index');
const { hasShebang } = require('./utils');

const exampleJsFile = path.join(__dirname, 'mocks/example.js');
const example2JsFile = path.join(__dirname, 'mocks/example2.js');
const exampleWithShebangJsFile = path.join(__dirname, 'mocks/exampleWithShebang.js');
const exampleHtmlFile = path.join(__dirname, 'mocks/example.html');

const parcelConfig = {
  target: 'node',
  outDir: './test',
  watch: false,
  cache: false,
  logLevel: 2,
  sourceMaps: false,
  production: true
};

describe('parcel-plugin-shebang testing', () => {
  createBundler = entryFiles => new Bundler(entryFiles, parcelConfig);

  beforeEach(() => delete process.env['PARCEL_PLUGIN_SHEBANG']);

  afterEach(() => rimraf.sync(path.join(__dirname, './test')));
  
  it('should stop plugin process when PARCEL_PLUGIN_SHEBANG environment variable is false', () => {
    process.env.PARCEL_PLUGIN_SHEBANG = false;

    const bundler = createBundler(exampleJsFile);
    const result = shebangPlugin(bundler);

    expect(result).toBeFalsy();
  });

  it('should plugin process for shebang found in entry point', async () => {
    const bundler = createBundler(exampleWithShebangJsFile);
    const result = shebangPlugin(bundler);

    await bundler.bundle();
    const content = fs.readFileSync(path.join(__dirname, './test/exampleWithShebang.js'), 'utf-8');

    expect(result).toBeTruthy();
    expect(hasShebang(content)).toBeTruthy();
  });

  it('should plugin process for valid parts of config', async () => {
    const bundler = createBundler(exampleJsFile);
    const result = shebangPlugin(bundler, [
      { test: 'It should not working!' },
      { test2: 'It should not working too!' },
      { interpreter: 'node', files: ['./mocks/example.js'] }
    ]);

    await bundler.bundle();
    const content = fs.readFileSync(path.join(__dirname, './test/example.js'), 'utf-8');

    expect(result).toBeTruthy();
    expect(hasShebang(content)).toBeTruthy();
  });

  it('should plugin process for multiple entry points', async () => {
    const bundler = createBundler([exampleJsFile, example2JsFile]);
    const result = shebangPlugin(bundler, [
      { interpreter: 'node', files: ['./mocks/example.js', './mocks/example2.js'] }
    ]);

    await bundler.bundle();
    const content = fs.readFileSync(path.join(__dirname, './test/example.js'), 'utf-8');
    const content2 = fs.readFileSync(path.join(__dirname, './test/example2.js'), 'utf-8');

    expect(result).toBeTruthy();
    expect(hasShebang(content)).toBeTruthy();
    expect(hasShebang(content2)).toBeTruthy();
  });

  it('should plugin process for multiple entry points and different shebangs', async () => {
    const bundler = createBundler([exampleJsFile, example2JsFile]);
    const result = shebangPlugin(bundler, [
      { interpreter: 'node', files: ['./mocks/example.js'] },
      { interpreter: 'python3', files: ['./mocks/example2.js'] },
    ]);

    await bundler.bundle();
    const content = fs.readFileSync(path.join(__dirname, './test/example.js'), 'utf-8');
    const content2 = fs.readFileSync(path.join(__dirname, './test/example2.js'), 'utf-8');

    expect(result).toBeTruthy();
    expect(hasShebang(content)).toBeTruthy();
    expect(hasShebang(content2)).toBeTruthy();
  });

  it('should not rewrite shebang for entry point', async () => {
    const bundler = createBundler(exampleJsFile);
    const result = shebangPlugin(bundler, [
      { interpreter: 'node', files: ['./mocks/example.js'] },
      { interpreter: 'python3', files: ['./mocks/example.js'] },
    ]);

    await bundler.bundle();
    const content = fs.readFileSync(path.join(__dirname, './test/example.js'), 'utf-8');

    expect(result).toBeTruthy();
    expect(hasShebang(content)).toBeTruthy();
  });

  it('should plugin process for children entry point', async () => {
    const bundler = createBundler(exampleHtmlFile);
    const result = shebangPlugin(bundler, [
      { interpreter: 'python3', files: ['./mocks/example.js'] },
    ]);

    const bundle = await bundler.bundle();

    let content = '';
    bundle.childBundles
      .forEach(({ name, parentBundle }) => {
        if (parentBundle.entryAsset.name === exampleHtmlFile) {
          content = fs.readFileSync(name, 'utf-8');
        }
      });

    expect(result).toBeTruthy();
    expect(hasShebang(content)).toBeTruthy();
  });
});
