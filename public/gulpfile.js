const gulp = require('gulp');
const typescript = require('gulp-typescript');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

gulp.task('compile', function(done) {
    gulp.src(['./lib/**/*.ts', '!./node_modules/**/*.ts'])
        .pipe(typescript())
        .js
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./build'));
    done();
})