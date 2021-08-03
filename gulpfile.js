const { src, dest, parallel, series, watch} = require('gulp');
const autoPrefixer = require('gulp-autoprefixer');
const sourcemaps = require   ('gulp-sourcemaps');
const GulpCleanCss = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require ('gulp-ttf2woff');
const ttf2woff2 = require ('gulp-ttf2woff2');
const fs = require('fs');
const del = require ('del');
const webpack = require ('webpack');
const webpackStream = require ('webpack-stream');
const  uglify = require('gulp-uglify-es').default



// Обработка шрифтов 
const fonts = () => {
  del(['app/fonts/*']) // Очистка папки со шрифтами
  //  конвертация 
  src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./app/fonts/'))
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./app/fonts/'))
    .pipe(browserSync.stream());
}

const cb = () => {}

// Переменные источника шрифтов 
let srcFonts = './src/scss/_fonts.scss';
let appSrcFonts = './src/fonts/';

// Обработка @include font-face
const fontsStyle = (done) => {
   
   let file_content = fs.readFileSync(srcFonts); // Чтение папки исходника

   fs.writeFile(srcFonts,'',cb);
   // Формирование @include font-face  в _fonts.scss
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


// Создание svg sprite
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


// Обработка HTML 
const htmlInclude = () => {
   return src(['./src/index.html'])
      .pipe(fileinclude({
         prefix: '@',
         basepath: '@file'
      }))
      .pipe(dest('./app'))
      .pipe(browserSync.stream());
}


// Обработка scss
const styles = () => {
   return src( './src/scss/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
         outputStyle: 'expanded'
      }).on('error', notify.onError()))
      .pipe(rename({
         suffix: '.min'
      }))
      .pipe(autoPrefixer({
         cascade: false,
      }))
      .pipe(GulpCleanCss({
         level:2
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('./app/css'))
      .pipe(browserSync.stream());
}


// Обработка build scss
const stylesBuild = () => {
   return src( './src/scss/**/*.scss')
      .pipe(sass({
         outputStyle: 'expanded'
      }).on('error', notify.onError()))
      .pipe(rename({
         suffix: '.min'
      }))
      .pipe(autoPrefixer({
         cascade: false,
      }))
      .pipe(GulpCleanCss({
         level:2
      }))
      .pipe(dest('./app/css'))
      
}
// Обработка изображений
const imgToApp = () => {
   return src(['./src/img/**.jpg' , './src/img/**.jpeg' ,'./src/img/**.png' ])
      .pipe(dest('./app/img'))
      .pipe(browserSync.stream());
}

// Очистка перед сборкой
const clean = () => {
   return del(['app/*'])
}

// Обработка js
const scripts = () => {
   return src('./src/js/main.js')
   .pipe(webpackStream({
      output:{
         filename:'main.js',
      },
      module: {
         rules: [
           {
             test: /\.m?js$/,
             exclude: /node_modules/,
             use: {
               loader: 'babel-loader',
               options: {
                 presets: [
                   ['@babel/preset-env', { targets: "defaults" }]
                 ]
               }
             }
           }
         ]
       }
   }))
   .pipe(sourcemaps.init())
   .pipe (uglify().on("error", notify.onError()))
   .pipe(sourcemaps.write('.'))
   .pipe(dest('./app/js'))
   .pipe(browserSync.stream());
}

// Обработка  build js
const scriptsBuild = () => {
   return src('./src/js/main.js')
   .pipe(webpackStream({
      output:{
         filename:'main.js',
      },
      module: {
         rules: [
           {
             test: /\.m?js$/,
             exclude: /node_modules/,
             use: {
               loader: 'babel-loader',
               options: {
                 presets: [
                   ['@babel/preset-env', { targets: "defaults" }]
                 ]
               }
             }
           }
         ]
       }
   }))
   .pipe (uglify().on("error", notify.onError()))
   .pipe(dest('./app/js'))
}


// Контроль изменений
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
   watch('./src/fonts/**.ttf' , fonts);
   watch('./src/fonts/**.ttf' , fontsStyle);
   watch('./src/js/**/*.js' , scripts);
}
// Экспорт
exports.watchFiles = watchFiles;
exports.styles = styles;
exports.fileinclude = htmlInclude;



exports.default = series(clean, parallel( htmlInclude,scripts,fonts,imgToApp,svgSprites),fontsStyle,styles,watchFiles);

exports.build = series(clean, parallel( htmlInclude,scriptsBuild,fonts,imgToApp,svgSprites),fontsStyle,stylesBuild,watchFiles);