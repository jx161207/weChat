'use strict';
const env = 'dev';
// 默认接口出错弹窗
const defaultAlertMessage = '请再试一次';
// 默认分享
const defaultShareText = {
  en: '微信小程序demo'
};
// 默认标题栏文字
const defaultBarTitle = {
  en: 'wechat demo'
};
// 文章默认图片
const defaultImg = {
     articleImg:'http://p1.music.126.net/A8qicH14toObbLpPMiKmBw==/109951163110962030.jpg?param=50y50&quality=100',
  coverImg: 'http://p4.music.126.net/qW4N08_Q8PSePV7iewwvHg==/3438172860758204.jpg?param=177y177'
};
let core = {
   env: env,
   defaultBarTitle: defaultBarTitle['en'],
   defaultImg: defaultImg,
   defaultAlertMsg: defaultAlertMessage,
   defaultShareText: defaultShareText['en'],
   isDev: env === 'dev',
   isProduction: env === 'production'
};
export default core;
