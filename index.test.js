/**
 * Shebang plugin for Parcel.
 * @author sintloer <contact@sintloer.com>
 */
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const Bundler = require('parcel-bundler');
const shebangPlugin = require('./index');

const exampleFile = path.join(__dirname, 'example.js');

describe('parcel-plugin-shebang', () => {
  afterAll(() => {
    rimraf.sync(path.join(__dirname, './test'));
  });

  it('should not plugin works when target is browser', () => {
    const bundler = new Bundler(exampleFile, {
      target: 'browser'
    });

    expect(shebangPlugin(bundler)).toBeFalsy();
  });

  it('should not plugin works when environment variable is false', () => {
    const bundler = new Bundler(exampleFile, {
      target: 'node'
    });

    process.env.PARCEL_PLUGIN_SHEBANG = false;
    expect(shebangPlugin(bundler)).toBeFalsy();
  });

  it('should plugin works when environment variable is true', () => {
    const bundler = new Bundler(exampleFile, {
      target: 'node'
    });

    process.env.PARCEL_PLUGIN_SHEBANG = true;
    expect(shebangPlugin(bundler)).toBeTruthy();
  });

  it('should plugin works when target is node', () => {
    const bundler = new Bundler(exampleFile, {
      target: 'node'
    });

    expect(shebangPlugin(bundler)).toBeTruthy();
  });

  it('should bundled file contains shebang', async () => {
    const bundler = new Bundler(exampleFile, {
      outDir: path.join(__dirname, '/test'),
      target: 'node',
      watch: false,
      cache: false,
      hmr: false,
      logLevel: 0
    });

    shebangPlugin(bundler);
    await bundler.bundle();
    const content = fs.readFileSync(path.join(__dirname, './test/example.js'), 'utf8');

    expect(content.includes('#!/usr/bin/env node\n')).toBeTruthy();
  });
});
