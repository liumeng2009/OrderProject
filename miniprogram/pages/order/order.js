// pages/order/order.js
const moment = require('moment');
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    saving: false,
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime() + 1000 * 60 * 30,
    maxDate: new Date().getTime() + 1000 * 60 * 30 + 1000 * 60 * 60 * 24 *365,
    currentDate: new Date().getTime(),
    currentDateStr: '',
    phone: null,
    phoneErrorMessage: '',
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
  checkPhone() {
    const phoneReg = /^[1][3,4,5,7,8，9][0-9]{9}$/;
    const forbidden = phoneReg.test(this.data.phone);
    return forbidden;
  },
  onClose() {
    this.setData({ show: false });
  },
  onPhoneInput(value) {
    if (this.data.phoneErrorMessage !== '') {
      this.setData({
        phoneErrorMessage: ''
      });
    }
    return value;
  },
  onPhoneBlur(value) {
    this.setData({
      phone: value.detail.value,
    });
  },
  onOrderHander() {
    console.log(this.data.phone);
    if (!this.data.phone) {
      this.setData({
        phoneErrorMessage: '请输入电话号码...'
      });
      return false;
    } else {
      if (!this.checkPhone()) {
        this.setData({
          phoneErrorMessage: '电话号码格式错误...'
        });
        return false;
      }
    }
    this.setLoading(true);
    db.collection('orders').add({
      data: {
        orderTime: moment(this.data.currentDate).toDate(),
        phone: this.data.phone,
        status: 1
      }
    }).then(res => {
      this.setLoading(false);
      wx.showToast({
        title: '预约成功.',
      })
    }).catch(err => {
      console.log(err);
      this.setLoading(false);
      wx.showToast({
        title: err.toString(),
      })
    })
  },

  setLoading(value) {
    this.setData({
      saving: value
    });
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