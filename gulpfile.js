const { src, dest } = require('gulp');
const concat = require('gulp-concat');
const inject = require('gulp-inject-string');
const mergeJson = require('gulp-merge-json');
const replace = require('gulp-replace');

const packageDef = require('./package.json');

const envSetting = (varName, defaultValue) => {
  if (process.env[varName]) {
    return process.env[varName];
  }

  if (process.env.ENV !== 'prod') {
    return defaultValue;
  }

  throw new Error(`${varName} is required in prod mode`);
};

const getAuthServer = () => envSetting('AUTH_SERVER', 'http://localhost:9000');

const getApiServer = () => envSetting('API_SERVER', 'http://localhost:9001');

const getClientID = () => envSetting('CLIENT_ID', 'SAMPLE_EXT_CLIENT_ID');

const apiServerPermission = () => `${getApiServer()}/*`;

const scriptConstants = {
  authServer: getAuthServer(),
  apiServer: getApiServer(),
  clientID: getClientID(),
  scopes: ['mailbox:create', 'mailbox:count'],
};

const getRuntime = (browser) => {
  if (browser.toLowerCase() === 'chrome') {
    return 'chrome';
  }

  return 'browser';
};

const combineSources = (browser, destination) => {
  const runtime = getRuntime(browser);
  const res = src([
    './src/background/*.js',
    '!**/index.js',
  ])
    .pipe(inject.prepend(
      `constants = ${JSON.stringify(scriptConstants)};\n\n`,
    ))
    .pipe(src('./src/background/index.js'))
    .pipe(concat('background.js'))
    .pipe(src([
      './src/**/*.js',
      '!./src/background/**',
      '!./src/manifests/**',
    ]))
    .pipe(replace('__RUNTIME__', runtime))
    .pipe(src([
      './src/**/*.html',
      './src/**/*.png',
      './src/**/*.ttf',
      '!./src/background/**',
      '!./src/manifests/**',
    ]))
    .pipe(dest(`${destination}/`));

  return res;
};

function defaultTask(cb) {
  combineSources();

  cb();
}

const buildManifest = (browser, destination) => {
  const endObj = {
    version: packageDef.version,
    permissions: [
      apiServerPermission(),
    ],
  };

  const fileName = 'manifest.json';

  src([
    './src/manifests/common.json',
    `./src/manifests/${browser}.json`,
  ])
    .pipe(mergeJson({
      fileName,
      endObj,
    }))
    .pipe(dest(`${destination}/`));
};

const outputDir = 'dist';

const packageExtension = (browser) => {
  const destination = `${outputDir}/${browser}`;
  buildManifest(browser, destination);
  combineSources(browser, destination);
};

function chromeTask(cb) {
  packageExtension('chrome');

  cb();
}

function firefoxTask(cb) {
  packageExtension('firefox');

  cb();
}

exports.default = defaultTask;
exports.chrome = chromeTask;
exports.firefox = firefoxTask;
