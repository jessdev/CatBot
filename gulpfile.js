var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');


var dependencies = ['main.js', 'datatable.js'];

gulp.task('build', function(){
    return gulp.src('lib/*')
    .pipe(concat('catbot.js'))
    .pipe(jshint())
    .pipe(uglify())
    .pipe(gulp.dest('build/'));
});