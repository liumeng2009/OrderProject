// pages/order/order.js
const moment = require('moment');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date().getTime() + 1000 * 60 * 60 * 24 *365,
    currentDate: new Date().getTime(),
    currentDateStr: ''
  },
  onDateClick() {
    this.setData({ show: true });
  },
  onDateConfirm(value) {
    this.setData({
      currentDate: value.detail,
      currentDateStr: moment(value.detail).format('YYYY年MM月DD日 hh:mm'),
      show: false,
    })
  },
  onClose() {
    this.setData({ show: false });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentDateStr: moment(this.data.currentDate).format('YYYY年MM月DD日 hh:mm'),
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})