var gulp = require('gulp'),
    sass = require('gulp-sass'),
    notify = require("gulp-notify"),
    gulpImport = require("gulp-html-import"),
    browserify = require("browserify"),
    tap = require("gulp-tap"),
    buffer = require("gulp-buffer"),
    sourcemaps = require('gulp-sourcemaps'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    imagemin = require('gulp-imagemin'),
    responsive = require('gulp-responsive'),
    browserSync = require('browser-sync').create();

// Default task
gulp.task("default",["js","html","sass"], function(){
    browserSync.init({proxy:"http://127.0.0.1:3100/"}); //Starting browsersync on the  src folder
    gulp.watch(["src/scss/*.scss", "src/scss/**/*.scss"], ["sass"]); // execute the sass task
    gulp.watch("src/*.html").on("change", browserSync.reload); //reload the html files
    gulp.watch("src/*.html", function(){
        browserSync.reload;
        notify().write("Browser reloaded");
    } )

    gulp.watch(["src/*.html","src/**/*.html"],["html"]);
    gulp.watch(["src/js/*.js","src/js/**/*.js"],["js"]);
});

// Compile SASS
gulp.task("sass", function(){
    gulp.src("src/scss/style.scss") //Loaded the style.scss file
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", function(error){
            return notify().write(error) // Show notification if there is an error
        })) //compile
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist/")) //save
        .pipe(browserSync.stream())// reload the css on browser
        .pipe(notify("SASS compiled")); //Show notifactions on screen
});

//Copy and import HTML
gulp.task("html", function(){
    gulp.src("src/*.html")
        .pipe(gulpImport("src/components/"))
        .pipe(htmlmin({collapseWhitespace:true})) // replace the htmls @import
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream())
        .pipe(notify("HTML imported"))

})

//Compile JS
gulp.task("js", function() {
    gulp.src("src/js/main.js")
        .pipe(tap(function(file){
            file.contents = browserify(file.path, {debug:true})
                .transform("babelify", {presets:["es2015"]})
                .bundle()
                .on("error", function(error) {
                    return notify().write(error);
                })
        }))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps:true}))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream())
        .pipe(notify("JS Compiled"))
})

// Resize and rename image task
gulp.task("img", function(){
    gulp.src("src/img/*")
        .pipe(responsive({
            "*.png":[
                {width: 150, rename:{suffix:"-150px"}},
                {width: 250, rename:{suffix:"-250px"}},
                {width: 300, rename:{suffix:"-300px"}}
            ]
        }))
        .pipe(imagemin())
        .pipe(gulp.dest("dist/img/"))
});
