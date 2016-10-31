var gulp = require('gulp')
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

var mainName = 'amazon-autocomplete';

gulp.task('clean', function () {
  return del(['./dist'])
})

gulp.task('script', function () {
  gulp.src('./_es5/'+mainName+'.js')
    .pipe(uglify())
    .pipe(rename(mainName+'.min.js'))
    .pipe(gulp.dest('./dist'))
})



gulp.task('default', ['clean'], function () {
  gulp.start('script')
  gulp.watch('./_es5/'+mainName+'.js', ['script'])
})

gulp.task('watch', function () {
  gulp.watch('./_es5/'+mainName+'.js', ['script'])
})