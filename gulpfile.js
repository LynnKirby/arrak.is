// SPDX-License-Identifier: CC0-1.0
// Written 2019 Lynn Kirby

const path = require("path");
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const pump = require("pump");

const registeredTasks = [];

const task = ({ name, src, pipeline }) => {
  // Ensure src is an array
  if (!Array.isArray(src)) src = [src];

  // By default all files with underscore are ignored
  src.push("!**/_*")

  // Add the source directory path to the source globs, fixing up negation
  // where necessary
  src = src.map(x => x.startsWith("!") ? `!./src/${x}` : `./src/${x}`);

  // Remember the input globs so that we know what static files to copy later
  // and what to update when watching
  registeredTasks.push({ name, src });

  // Arrayify a single pipeline
  if (!Array.isArray(pipeline)) pipeline = [pipeline];

  gulp.task(name, cb => {
    // Pumpify the entire task pipeline
    pump([
      gulp.src(src, { base: "./src" }),
      ...pipeline,
      gulp.dest("./dist"),
      browserSync.stream(),
    ], cb)
  });
};

//******************************************************************************
// Task: static

gulp.task("static", cb => {
  // Make a list of all the source globs and negate them.
  let staticGlobs = registeredTasks.flatMap(task => {
    return task.src.map(filename => {
      if (filename.startsWith("!")) return filename.slice(1);
      return `!${filename}`;
    });
  });

  // Then add all other files except underscored ones
  staticGlobs = [
    "./src/**/*",
    ...staticGlobs,
    "!./src/**/_*",
  ];

  pump([
    gulp.src(staticGlobs),
    gulp.dest("./dist"),
  ], cb);
});

//******************************************************************************
// Task: serve

gulp.task("serve", () => {
  registeredTasks.forEach(task => {
    gulp.watch(task.src, { ignoreInitial: false }, gulp.parallel([task.name]));
  });

  browserSync.init({
    server: {
      baseDir: ["./dist"]
    }
  });
});

//******************************************************************************
// Task: css

const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const postcssPresetEnv = require("postcss-preset-env");
const sass = require("gulp-sass");
sass.compiler = require("sass");

task({
  name: "css",
  src: "style/*.scss",
  pipeline: [
    sourcemaps.init(),
    sass({
      includePaths: ["node_modules"]
    }),
    postcss([
      postcssPresetEnv(),
      cssnano(),
    ]),
    sourcemaps.write("."),
  ]
});

//******************************************************************************
// Task: pug

const pug = require("gulp-pug");

task({
  name: "pug",
  src: "**/*.pug",
  pipeline: pug()
});


//******************************************************************************
// Task: default (build)

gulp.task("default", gulp.parallel([
  "static",
  ...registeredTasks.map(task => task.name),
]));
