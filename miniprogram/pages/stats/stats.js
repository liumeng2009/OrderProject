const moment = require('moment');
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: []
  },

  getOrders() {
    db.collection('orders').orderBy('orderTime', 'desc').get()
      .then(res => {
        for(const r of res.data) {
          //判断超期或者预约中
          if (moment().diff(moment(r.orderTime)) < 0) {
            r.status = '预约成功';
          } else {
            r.status = '预约已到期';
          }
          // 格式化
          r.orderTime = moment(r.orderTime).format('YYYY-MM-DD HH:mm');
        }
        this.setData({
          orders: res.data
        })
        console.log(this.data);
      }).catch(err => {
        wx.showToast({
          title: err,
        })
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getOrders();
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