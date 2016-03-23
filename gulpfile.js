var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');


var dependencies = ['catbot.js', 'datatable.js'];

gulp.task('build', function(){
    return gulp.src(dependencies)
    .pipe(concat('catbot-min.js'))
    .pipe(jshint())
    .pipe(uglify())
    .pipe(gulp.dest('./'));
});