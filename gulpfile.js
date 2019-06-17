// SPDX-License-Identifier: 0BSD

const fs = require("fs-extra");
const gulp = require("gulp");
const execa = require("gulp-execa");
const filter = require("gulp-filter");
const favicons = require("favicons").stream;
const sourcemaps = require("gulp-sourcemaps");
const gulpPostcss = require("gulp-postcss");
const cssnano = require("cssnano");
const postcssPresetEnv = require("postcss-preset-env");
const postcssImport = require("postcss-import");
const postcssUrl = require("postcss-url");
const browserSync = require("browser-sync").create();

//******************************************************************************
// task: favicons
// Output icons and other generated files to `public`.
// The set of HTML meta tags gets saved as an include file in `src/includes`.

const faviconTaskBase = ({ metaOnly } = {}) => () => {
  const f = filter("*.html", { restore: true, passthrough: !!metaOnly });

  const stream = gulp.src("./src/assets/logo.png")
    .pipe(favicons({
      url: "https://arrak.is",
      appName: "arrak.is",
      appDescription: "Lynn Kirby's homepage",
      developerName: "Lynn Kirby",
      developerURL: "https://arrak.is",
      background: "#020307",
      theme_color: "#fff",
      display: "browser",
      start_url: "/",
      version: require("./package.json").version,
      html: "favicons.generated.html",
      pipeHTML: true,
    }))
    .pipe(f)
    .pipe(gulp.dest("./src/includes"));

  if (!metaOnly) {
    f.restore.pipe(gulp.dest("./public"));
  }

  return stream;
};

gulp.task("favicons", faviconTaskBase());
gulp.task("favicons:meta", faviconTaskBase({ metaOnly: true }));

//******************************************************************************
// Task: styles

gulp.task("styles", () => {
  return gulp.src(["./src/assets/styles/**/*.css", "!**/_*.css"])
    .pipe(sourcemaps.init())
    .pipe(gulpPostcss([
      postcssImport(),
      postcssUrl({
        url: "rebase"
      }),
      postcssPresetEnv(),
      cssnano(),
    ]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./public/assets/styles"));
});

gulp.task("styles:watch", () => {
  gulp.watch("./src/assets/styles/**/*.css", { ignoreInitial: false }, gulp.task("styles"));
});

//******************************************************************************
// Task: static

gulp.task("static:other", () => {
  return gulp.src("./src/static/**/*", {
    dot: true,
    since: gulp.lastRun("static:other"),
  }).pipe(gulp.dest("./public"));
});

gulp.task("static:assets", () => {
  return gulp.src(["./src/assets/**/*", "!**/*.css", "!**/_*"], {
    since: gulp.lastRun("static:assets"),
  }).pipe(gulp.dest("./public/assets"));
});

gulp.task("static", gulp.parallel("static:other", "static:assets"));

gulp.task("static:watch", () => {
  gulp.watch("./src/static/**/*", { ignoreInitial: false }, gulp.task("static:other"));
  gulp.watch("./src/assets/**/*", { ignoreInitial: false }, gulp.task("static:assets"));
});

//******************************************************************************
// Task: clean

gulp.task("clean", () => fs.emptyDir("./public"));

//******************************************************************************
// Task: 11ty

gulp.task("11ty", execa.task("eleventy"));
gulp.task("11ty:watch", execa.task("eleventy --watch"));

//******************************************************************************
// Task: build (default)

gulp.task("build", gulp.series(
  "clean",
  "favicons",
  gulp.parallel("styles", "static", "11ty"),
));

gulp.task("default", gulp.task("build"));

//******************************************************************************
// Task: serve

gulp.task("serve", () => {
  browserSync.init({
    server: {
      baseDir: "./public",
    },
    watch: true,
  });
});

//******************************************************************************
// Task: watch

gulp.task("watch", gulp.parallel(
  "styles:watch",
  "static:watch",
  "11ty:watch",
  "serve",
));
