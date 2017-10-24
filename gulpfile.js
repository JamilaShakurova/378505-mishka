"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var minifyjs = require("gulp-js-minify");
var server = require("browser-sync").create();
var run = require("run-sequence");
var del = require("del");
var cheerio = require("gulp-cheerio");

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"));
});

gulp.task("minify-js", function() {
  gulp.src("js/script.js")
  .pipe(minifyjs())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest("build/js"));
});

gulp.task("images", function() {
    return gulp.src("img/**/*.{png,jpg,svg}")
     .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.jpegtran({progressive: true}),
        imagemin.svgo()
    ]))
     .pipe(gulp.dest("img"));
});

gulp.task("webp", function() {
    return gulp.src("img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function() {
    return gulp.src("img/icon-*.svg")
    .pipe(cheerio({
      run: function($) {
        $("[fill]").removeAttr("fill");
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
    return gulp.src("*.html")
    .pipe(posthtml([
        include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html", ["html"]);
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "style",
    "sprite",
    "html",
    done
  );
});

gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*.{woff,woff2}",
      "img/**",
      "js/**"
  ], {
      base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
    return del("build");
});
