// SPDX-License-Identifier: CC0-1.0
// Written 2019 Lynn Kirby

const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const execa = require("execa");
const gulpExeca = require("gulp-execa");
const fs = require("fs-extra");

//******************************************************************************
// Task: serve

gulp.task("serve", cb => {
  browserSync.init({
    server: {
      baseDir: ["./dist"],
    },
    watch: true
  });

  gulp.watch("src/styles/**/*.scss", { ignoreInitial: false }, gulp.parallel(["css"]));
  execa("eleventy --watch --passthroughall").catch(error => cb(error));
});

//******************************************************************************
// Task: css

const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const postcssPresetEnv = require("postcss-preset-env");
const sass = require("gulp-sass");
sass.compiler = require("sass");

gulp.task("css", () => {
  return gulp.src(["./src/styles/**/*.scss", "!**/_*.scss"], { base: "./src" })
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      postcssPresetEnv(),
      cssnano(),
    ]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./dist"));
});

//******************************************************************************
// Task: 11ty

gulp.task("11ty", gulpExeca.task("eleventy --passthroughall"));

//******************************************************************************
// Task: clean

gulp.task("clean", () => fs.emptyDir("dist"));

//******************************************************************************
// Task: default

gulp.task("default", gulp.series([
  "clean",
  gulp.parallel(["css", "11ty"]),
]));
