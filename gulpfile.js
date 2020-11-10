const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const minify = require("gulp-minify");
const htmlmin = require("gulp-htmlmin");
const ghPages = require("gh-pages");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// CSS min

const cssMin = () => {
  return gulp.src("source/css/style.css")
        .pipe(csso())
        .pipe(rename("styles.min.css"))
        .pipe(gulp.dest("source/css"))
}

exports.cssMin = cssMin;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
        .pipe(imagemin([
          imagemin.optipng({optimizationLevel: 3}),
          imagemin.mozjpeg({progressive: true}),
          imagemin.svgo()
        ]))
}

exports.images = images;

// WebP

const webP = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
        .pipe(webp({quality: 75}))
        .pipe(gulp.dest("source/img"))
}

exports.webp = webP;

// Sprite

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
        .pipe(svgstore())
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Copy

const copy = () => {
  return gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico",
    "source/*.html",
    "source/css/*.css"
  ], {
    base: "source"
     })
            .pipe(gulp.dest("build"))
}

exports.copy = copy;

// Delete

const clean = () => {
  return del("build");
}

exports.clean = clean;

// HTML

const html = () => {
  return gulp.src("source/*.html")
        .pipe(htmlmin())
        .pipe(gulp.dest("build"))
}

exports.html = html;

// gh-pages

const gh_pages = () => {
  return ghPages.publish("build", function(err) {});
}

exports.gh_pages = gh_pages;

// Build

const build = gulp.series(
      clean,
      html,
      styles,
      cssMin,
      copy,
      sprite,
    )

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "source"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/scss/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  build, server, watcher
);
