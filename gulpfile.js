/* eslint-disable no-console */
require('dotenv').config();

// Dependencies ------------------------------------------------------------------------- >
const gulp = require('gulp');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const minifyJS = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const rollup = require('gulp-better-rollup');
const rollupPluginRe = require('rollup-plugin-replace');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const rollupCommonJs = require('rollup-plugin-commonjs');
const wrap = require('gulp-wrap');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const confirm = require('gulp-confirm');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');
const sftp = require('gulp-sftp-up4');
const chalk = require('chalk');
const replace = require('gulp-replace');
const stripComments = require('gulp-strip-comments');
const beautify = require('gulp-cssbeautify');
const fs = require('fs');
const { argv } = require('yargs');

// Server config  ----------------------------------------------------------------------- >
const ftpDetails = {
  DB_HOST: 'YOUR HOST NAME HERE',
  DB_USER: 'YOUR USERNAME HERE',
  DB_PASS: 'YOUR PASSWORD HERE',
  REMOTE_PATH: '/YOUR/FILE/PATH/HERE',
};

// Arguments ------------------------------------------------------------------------- >
/** @type {String} Experiment folder name */
const experimentName = argv.experimentname || argv.fn;

/** @type {String} Client folder name */
const clientName = argv.clientname || argv.cn;

// Options --------------------------------------------------------------------------- >
/** @type {String} ID */
const id = argv.id || experimentName;

/**
 * @typedef {String} variation Variation name/number
 * @typedef {Boolean} lint Enable linting
 * @typedef {Boolean} keepComments Retain comments in unminifed transpiled code
 * @typedef {Boolean} notifications Enable gulp notifications
 */
const {
  variation,
  lint,
  keepComments,
  notifications,
} = argv;

// Directories ----------------------------------------------------------------------- >
// Local
const dir = `./clients/${clientName}/${experimentName}`;
const src = '/src';
const srcAllSassLocation = `${dir}${src}/**/*.scss`;
const srcJsLocation = `${dir}${src}/*.js`;
const imagesLocation = `${dir}${src}/images/*.*`;
const outputFolder = `${dir}/dist/`;
const outputFiles = `${dir}/dist/*`;
const localFilesGlob = [outputFiles];

// Tasks ----------------------------------------------------------------------------- >
// SASS - [Compile, Autoprefix, Rename, Minify]
gulp.task('sass', () => gulp.src(srcAllSassLocation)
  .pipe(replace(/--VARIATION--/, variation || 1))
  .pipe(replace(/--ID--/, id || ''))
  .pipe(sass({ includePaths: ['./node_modules/compass-mixins/lib'] })
    .on('error', sass.logError))
  .pipe(autoprefixer({
    cascade: false,
    remove: false,
  }))
  .pipe(beautify())
  .pipe(replace('--ID--', id || '')) // Required again for when we use @import directive
  .pipe(concat(`${experimentName}.css`))
  .pipe(gulp.dest(outputFolder))
  .pipe(cleanCSS({ compatibility: 'ie8' }))
  .pipe(rename(`${experimentName}.min.css`))
  .pipe(gulp.dest(`${outputFolder}/min`)));

// JS - [Lint, Concatenate, Rename, Minify]
gulp.task('scripts', () => gulp.src(srcJsLocation)
  .pipe(gulpif(lint, eslint()))
  .pipe(gulpif(lint, eslint.format()))
  .pipe(gulpif(lint, eslint.failAfterError()))
  .pipe(rollup({
    plugins: [
      rollupPluginRe({
        VARIATION: variation || 1,
        ID: id || '',
        delimiters: ['{{', '}}'],
      }),
      rollupNodeResolve({ mainFields: ['main', 'jsnext'] }),
      rollupCommonJs({ include: /node_modules/ }),
    ],
  }, { format: 'cjs' }))
  .on('error', (error) => {
    console.error(error);
  })
  .pipe(wrap('(function() {\n<%= contents %>\n})();'))
  .pipe(rename(`${experimentName}.js`))
  .pipe(gulpif(!keepComments, stripComments()))
  .pipe(gulp.dest(outputFolder))
  .pipe(minifyJS({
    ext: { min: '.min.js' },
    noSource: true,
    exclude: ['dist/min'],
    ignoreFiles: ['.combo.js', '-min.js', '.min.js'],
  }))
  .pipe(gulp.dest(`${outputFolder}/min`)));

// Images - [Rename]
gulp.task('images', () => gulp.src(imagesLocation)
  .pipe(rename({ prefix: `${experimentName}-` }))
  .pipe(gulp.dest(outputFolder)));

// Deploy files to your server
gulp.task('ftp-deploy', gulp.series(() => gulp.src(localFilesGlob)
  .pipe(sftp({
    host: process.env.DB_HOST || ftpDetails.DB_HOST,
    user: process.env.DB_USER || ftpDetails.DB_USER,
    pass: process.env.DB_PASS || ftpDetails.DB_PASS,
    remotePath: ftpDetails.REMOTE_PATH,
  }))
  .pipe(gulpif(notifications, notify({
    message: 'New files deployed',
    onLast: true,
  })))));

// Create new experiment from template files
gulp.task('experiment-create', () => {
  const newExperimentFolder = `./clients/${clientName}/${experimentName}`;

  if (fs.existsSync(newExperimentFolder)) {
    console.log(chalk.bgRed.white.bold('This experiment already exists. If you create this experiment you will overwrite the existing folder.'));
  }

  return gulp.src(['./template/**/*'])
    .pipe(confirm({
      question: `You are creating a new experiment (${experimentName} for ${clientName}). This will overwrite any existing files with the same names. Do you want to proceed? [y/n]`,
      proceed: answer => answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes',
    }))
    .pipe(notify({
      message: `Experiment ${experimentName} successfully created`,
      onLast: true,
    }))
    .pipe(gulp.dest(`${newExperimentFolder}/src`));
});

// Default task
gulp.task('default', gulp.series('sass', 'scripts', 'images', 'ftp-deploy', () => {
  notify({ message: 'Watching /src for changes' });

  const watcher = gulp.watch(dir + src);
  watcher.on('change', gulp.series('scripts', 'sass', 'images', 'ftp-deploy', () => {
    console.log('[watcher] File was modified, compiling...');
  }));
}));
