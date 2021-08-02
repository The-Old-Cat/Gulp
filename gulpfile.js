const { src, dest, parallel, series, watch} = require('gulp');
const autoPrefixer = require('gulp-autoprefixer');
// const GulpCleanCss = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
// const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require ('gulp-ttf2woff');
const ttf2woff2 = require ('gulp-ttf2woff2');
const fs = require('fs');
const del = require ('del');





const fonts = () => {
  del(['app/fonts/*'])
  src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./app/fonts/'))
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./app/fonts/'))
    .pipe(browserSync.stream());
}

const cb = () => {}

let srcFonts = './src/scss/_fonts.scss';
let appSrcFonts = './src/fonts/';


const fontsStyle = (done) => {
   
   let file_content = fs.readFileSync(srcFonts);

   fs.writeFile(srcFonts,'',cb);
   fs.readdir(appSrcFonts,function(err,items) {
      if(items) {
         let c_fontname;
         for (var i = 0; i < items.length; i++) {
            let fontname = items[i].split('.');
            fontname = fontname[0];
            if (c_fontname != fontname){
               fs.appendFile(srcFonts,'@include font-face("'+ fontname +'","'+ fontname +'" , 400);\r\n' , cb);
            }
            c_fontname = fontname;
         }
      }
   })
   done();
}

const svgSprites = () => {
   return src('./src/img/**/*.svg')
      .pipe(svgSprite({
         mode :{
            stack:{
               sprite:"../sprite.svg"
            }
         }
      }))
      .pipe(dest('./app/img/sprite'))
      .pipe(browserSync.stream());
}

const htmlInclude = () => {
   return src(['./src/index.html'])
      .pipe(fileinclude({
         prefix: '@',
         basepath: '@file'
      }))
      .pipe(dest('./app'))
      .pipe(browserSync.stream());
}

const styles = () => {
   return src( './src/scss/**/*.scss')
      .pipe(sass({
         outputStyle: 'expanded'
      }).on('error', notify.onError()))
      // .pipe(rename({
      //    suffix:'.min'
      // }))
      .pipe(autoPrefixer({
         cascade: false,
      }))
      // .pipe(GulpCleanCss({
      //    level:2
      // }))
      .pipe(dest('./app/css'))
      .pipe(browserSync.stream());
}
const imgToApp = () => {
   return src(['./src/img/**.jpg' , './src/img/**.jpeg' ,'./src/img/**.png' ])
      .pipe(dest('./app/img'))
      .pipe(browserSync.stream());
}

const cssToApp = () => {
   return src(['./src/css/**/*'])
      .pipe(dest('./app/assets/css'))
      .pipe(browserSync.stream());
}

const jsToApp = () => {
   return src(['./src/js/**/*'])
      .pipe(dest('./app/assets/js'))
      .pipe(browserSync.stream());
}

const clean = () => {
   return del(['app/*'])
}

const watchFiles = () => {
   browserSync.init({
      server: {
          baseDir: "./app"
      }
  });
   watch('./src/index.html' , htmlInclude);
   watch('./src/scss/**/*.scss' , styles);
   watch('./src/img/**.jpg' , imgToApp);
   watch('./src/img/**.png' , imgToApp);
   watch('./src/img/**.jpeg' , imgToApp);
   watch('./src/img/**/*.svg', svgSprites);
   watch('./src/css/**/*', cssToApp);
   watch('./src/js/**/*', jsToApp);
   watch('./src/fonts/**.ttf' , fonts);
   watch('./src/fonts/**.ttf' , fontsStyle);
   
}
exports.watchFiles = watchFiles;
exports.styles = styles;
exports.fileinclude = htmlInclude;



exports.default = series(clean,parallel( htmlInclude,fonts,imgToApp,svgSprites),fontsStyle,styles,watchFiles);