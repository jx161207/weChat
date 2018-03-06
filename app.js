'use strict';
import util from './utils/index';
//app.js
let handler = {
  onLaunch (){
    console.log('初始化');
    this.getDevideInfo();
    //初始化缓存数据
    util.getStorageData('visited',(data)=> {
      this.globalData.visitedArticles = data;
    });
  },
  alert(title = '提示', content = '请再试一次'){
    wx.showModal({
      title: title,
      content: content
    })
  },
  getDevideInfo(){
     let self = this;
     wx.getSystemInfo({
       success: function(res) {
         self.globalData.deviceInfo = res;
       },
     })
  },
  // 全局数据
  globalData: {
    user: {
      openId: null
    },
    visitedArticles: '', //全局变量，存储已经访问过的文章的contentId
    deviceInfo: {}
  }
};
App(handler);