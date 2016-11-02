var gulp = require('gulp'),
  bowerFiles = require('main-bower-files'),
  jshint = require('gulp-jshint'), //编译 JavaScript 插件
  inject = require('gulp-inject'),//引用静态资源插件
  webserver = require('gulp-webserver');//启动服务器插件

//项目 paths
var paths = {
  js: ['./app/js/app.js', './app/js/**/*.js'],
  css: ['./app/css/**/*.css'],
  templates: './app/js/templates.js',
  buildjs: ['./app/build/**/*.js'],
  buildcss: ['./app/build/**/*.css']
};

gulp.task('jshint', function() {// 编译 JavaScript,依赖插件 glup-jshintt
  gulp.src(paths.js)
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

gulp.task('devIndex', function () {//引用静态资源
  return gulp.src('./app/index.html')
      .pipe(
        inject(
          gulp.src(paths.js, {read: false}),
          {relative: true}
        )
      )
      .pipe(
        inject(
          gulp.src(paths.css, {read: false}),
          {relative: true}
        )
      )
      .pipe(
        inject(
          gulp.src(bowerFiles(), {read: false}),
          {name: 'bower', relative: true}
        )
      )
      .pipe(gulp.dest('./app'));
});

gulp.task('webserver', function() {//启动服务器
  gulp.src('app')
    .pipe(webserver({
      livereload: true,
      open: true,
      port: 9000
    }));
});

// 默认启动命令
gulp.task('default', ['jshint','devIndex'], function() {
  gulp.run('webserver');
});



