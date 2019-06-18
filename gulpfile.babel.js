// SPDX-License-Identifier: 0BSD

import fs from "fs-extra";
import gulp from "gulp";
import * as execa from "gulp-execa";
import filter from "gulp-filter";
import { stream as favicons } from "favicons";
import sourcemaps from "gulp-sourcemaps";
import gulpPostcss from "gulp-postcss";
import cssnano from "cssnano";
import postcssPresetEnv from "postcss-preset-env";
import postcssImport from "postcss-import";
import postcssUrl from "postcss-url";
import BrowserSync from "browser-sync";
const browserSync = BrowserSync.create();
import * as rollup from "rollup";
import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";

//******************************************************************************
// task: favicons
// Output icons and other generated files to `public`.
// The set of HTML meta tags gets saved as an include file in `src/_includes`.

gulp.task("favicons", () => {
  const f = filter("*.html", { restore: true, passthrough: false });

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
    .pipe(gulp.dest("./src/_includes"));

  f.restore.pipe(gulp.dest("./public"));
  return stream;
});

//******************************************************************************
// Task: style

gulp.task("style", () => {
  return gulp.src(["./src/assets/style/**/*.css", "!**/_*.css"])
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
    .pipe(gulp.dest("./public/assets/style"));
});

gulp.task("style:watch", () => {
  gulp.watch(
    "./src/assets/style/**/*.css",
    { ignoreInitial: false },
    gulp.task("style"));
});

//******************************************************************************
// Task: script

const rollupInputOptions = {
  input: './src/assets/script/main.js',
  plugins: [
    babel({
      babelrc: false,
      presets: ["@babel/preset-env"]
    }),
    uglify(),
  ]
};

const rollupOutputOptions = {
  file: './public/assets/script/main.js',
  format: 'iife',
  name: 'arrakis',
  sourcemap: true
};

gulp.task("script", async () => {
  const bundle = await rollup.rollup(rollupInputOptions);
  await bundle.write(rollupOutputOptions);
});

gulp.task("script:watch", cb => {
  const watcher = rollup.watch({
    ...rollupInputOptions,
    output: rollupOutputOptions,
    watch: {
      chokidar: true,
      include: "src/assets/script/**/*.js",
    }});

  watcher.on('event', event => {
    switch(event.code) {
      case "START":
        console.log("[rollup] starting");
        break;
      case "BUNDLE_START":
        console.log(`[rollup] bundle started: ${event.input}`);
        break;
      case "BUNDLE_END":
        console.log(`[rollup] bundle end: ${event.input}`);
        break;
      case "ERROR":
        console.error(`[rollup] ${event.error}`);
        break;
      case "FATAL":
        console.error(`[rollup] error: ${event.error}`);
        cb(false);
        break;
    }
  });
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
  gulp.parallel("style", "11ty", "script"),
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
  "style:watch",
  "11ty:watch",
  "script:watch",
  "serve",
));
