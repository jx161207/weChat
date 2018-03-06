//index.js
'use strict';

import util from '../../utils/index';
import config from '../../utils/config';

let app = getApp();
let isDEV = config.isDev;

let handler = {
   data: {
     page: 1, //当前页码
     days: 3,
     pageSize: 4,
     totalSize: 0,
     hasMore: true,
     articleList: [],
     defaultImg: config.defaultImg
   },
   onLoad (options) {
     this.setData({
       hiddenLoading: false
     })
     this.requestArticle()
   },
  //  获取文章列表数据
   requestArticle() {
     util.request({
       url: 'list',
       mock: true,
       data: {
         tag: '数据',
         start: this.data.page || 1,
         days: this.data.days || 3,
         pageSize: this.data.pageSize,
         langs: config.appLang || 'en'
       }
     })
     .then(res => {
       console.log(res)
      //  数据正常返回
      if(res && res.status === 0 && res.data && res.data.length) {
        let articleData = res.data;
        let formatData = this.formatArticleData(articleData); //原始数据格式化
        console.log(formatData);
        this.renderArticle(formatData);
      }
      else if (this.data.page === 1 && res.data && res.data.length === 0) {
        util.alert();
        this.setData({
          hasMore: false //如果加载第一页没有数据，默认提示信息，下拉加载功能不可用
        });
      }
      else if (this.data.page !== 1 && res.data && res.data.length === 0) {
        this.setData({
          hasMore: false //如果为最后一页，下拉加载功能不可用
        });
      }
      else {
        util.alert('提示',res);
        this.setData({
          hasMore: false //展示后台返回的错误信息，下拉加载功能不可用
        });
        return null;
      }
     });
   },
   //文章列表数据格式化
   formatArticleData(data){
     let formatData = undefined;
     if(data && data.length){
       //日期格式化
       formatData = data.map((group) => {
         group.formateDate = this.dateConvert(group.date);
         if(group && group.articles) {
           let formatArticleItems = group.articles.map((item) => {
              item.hasVisited = this.isVisited(item.contentId);
              return item;
           }) || [];
           group.articles = formatArticleItems;
         }
         return group
       })
     }
     return formatData;
   },
   //格式化日期
   dateConvert (dateStr){
     if (!dateStr){
       return '';
     }
     let today = new Date(),
     todayYear = today.getFullYear(),
     todayMonth = ('0' + (today.getMonth() + 1)).slice(-2),
     todayDay = ('0'+today.getDate()).slice(-2);
  let convertStr = '';
  let orginYear = +dateStr.slice(0,4);
  let todayFormat = `${todayYear}-${todayMonth}-${todayDay}`;
  if (dateStr === todayFormat){
    convertStr = '今天';
  } else if (orginYear < todayYear){
    let splitStr = dateStr.split('-');
    convertStr = `${splitStr[0]}年${splitStr[1]}月${splitStr[2]}日`;
  } else{
    convertStr = dateStr.slice(5).replace('-','月') + '日';
  }
    return convertStr;
   },
  //是否访问过
   isVisited(contentId) {
     let visitedArticles = app.globalData && app.globalData.visitedArticles || '';
     return visitedArticles.indexOf(`${contentId}`) > -1;
   },
   //数据拼接
   renderArticle (data) {
     if(data && data.length) {
       let newList = this.data.articleList.concat(data);
       this.setData({
         articleList: newList,
         hiddenLoading: true
       })
     }
   },
   //下拉更新
   onReachBottom(){
     if(this.data.hasMore){
       let nextPage = this.data.page + 1;
       this.setData({
         page: nextPage
       });
       this.requestArticle();
     }
   },
   //分享功能
  onShareAppMessage(){
    let title = config.defaultShareText || '';
    return {
      title: title,
      path:`/pages/index/index`,
      success:function(res){

      },
      fail: function(res){

      }
    }
  },
  showDetail (e) {
    let dataset = e.currentTarget.dataset;
    let item = dataset && dataset.item;
    let contentId = item.contentId || 0;
    // 实现阅读标识
    this.markRead(contentId);
    wx.navigateTo({
      url: `../detail/detail?contentId=${contentId}`,
    });
  },
  // 阅读标识
  markRead(contentId){
    util.getStorageData('visited',(data)=> {
      let newStorage = data;
      if(data){
        if(data.indexOf(contentId) === -1){
          newStorage = `${data},${contentId}`;
        }
      }
      else{
        newStorage = `${contentId}`;
      }
      if(data !== newStorage){
        if(app.globalData){
          app.globalData.visitedArticles = newStorage;
        }
        util.setStorageData('visited',newStorage, ()=>{
          this.resetArticles();
        });
      }
    });
  },
  resetArticles(){
    let old = this.data.articleList;
    let newArticles = this.formatArticleData(old);
    this.setData({
      articleList: newArticles
    });
  },
}
Page(handler) 