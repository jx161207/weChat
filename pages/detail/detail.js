'use strict';

import util from '../../utils/index';
import config from '../../utils/config';

import WxParse from '../../lib/wxParse/wxParse';//解析content文本为小程序视图
import HtmlFormater from '../../lib/htmlFormater'; //把html转为标准安全的格式

let app = getApp();
Page({
  onLoad (option) {
    let id = option.contentId || 0;
    this.setData({
      isFromShare: !!option.share
    });
    this.init(id);
  },
  data: {
    scrollTop: 0,
    detailData: {

    }
  },
  articleRevert () {
    let htmlContent = this.data.detailData && this.data.detailData.content;
    WxParse.wxParse('article','html',htmlContent,this,0);
  },
  init (contentId) {
    if (contentId) {
      this.goTop();
      this.requestDetail(contentId)
       .then(data => {
         this.configPageData(data)
       })
       .then(()=> {
         this.articleRevert()
       })
    }
  },
  configPageData(data){
     if (data) {
       //同步数据到model层，视图层自动渲染
       this.setData({
         detailData: data
       });
       //设置标题
       let title = this.data.detailData.title || config.defaultBarTitle;
       wx.setNavigationBarTitle({
         title: title,
       })
     }
  },
  requestDetail(contentId) {
    return util.request({
      url: 'detail',
      mock: true,
      data: {
        source: 1
      }
    })
    .then(res => {
      let formateUpdateTime = this.formateTime(res.data.lastUpdateTime);
      res.data.formateUpdateTime = formateUpdateTime;
      return res.data
    })
  },
  formateTime (timeStr = '') {
    let year = timeStr.slice(0, 4),
        month = timeStr.slice(5, 7),
        day = timeStr.slice(8, 10);
    return `${year}/${month}/${day}`;
  },
  next() {
    this.requestNextContentId().then(data => {
      let contentId = data && data.contentId || 0;
      this.init(contentId);
    })
  },
  requestNextContentId () {
    let pubDate = this.data.detailData && this.data.detailData.lastUpdateTime || '';
    let contentId = this.data.detailData && this.data.detailData.contentId || 0;
    return util.request({
      url: 'detail',
      mock: true,
      data: {
        tag: "微信热门",
        pubDate : pubDate,
        contentId: contentId,
        langs: config.appLang || 'en'
      }
    })
    .then(res => {
      if(res && res.status === 0 && res.data && res.data.contentId) {
        util.log(res)
        return res.data
      } else {
        util.alert('提示', '没有更多文章了！')
        return null
      }
    })
  },
  goTop () {
    this.setData({
      scrollTop: 0
    })
  },
  onShareAppMessage () {
    let title = this.data.detailData && this.data.detailData.title || config.defaultShareText;
    let contentId = this.data.detailData && this.data.detailData.contentId || 0;
    return {
      title: title, //分享的标题
      path: `/pages/detail/detail?share=1&contentId=${contentId}`,
      success: function(res){

      },
      fail: function(res) {

      }
    }
  },
  //版本不支持的情况
  notSupportShare () {
    let device = app.globalData.deviceInfo;
    let sdkVersion = device && device.SDKVersion || '1.0.0';
    return /1\.0\.0|1\.0\.1|1\.1\.0|1\.1\.1/.test(sdkVersion);
  },
  share () {
    if (this.notSupportShare()) {
      wx.showModal({
        title: '提示',
        content: '微信版本较低，请点击右上角分享',
      })
    }
  },
  back(){
    if (this.data.isFromShare) {
      wx.navigateTo({
        url: '../index/index',
      })
    } else {
      wx.navigateBack()
    }
  }
});
