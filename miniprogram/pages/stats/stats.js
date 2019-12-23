const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
import Dialog from 'vant-weapp/dialog/dialog';
Page({
  data: {
    orders: [],
    openid: ''
  },
  getOrders() {
    Toast.loading({
      mask: true,
      message: '加载中.'
    });
    db.collection('orders').where({
      'seats.openid': this.data.openid
    }).get()
    .then(res => {
      console.log(res);
      Toast.clear();
      wx.stopPullDownRefresh();
      this.setData({
        orders: res.data
      });
    }).catch(err => {
      Toast.clear();
      wx.stopPullDownRefresh();
      Toast(err.toString());
    });
  },
  initLogin() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const openid = res.result.openid;
      this.setData({
        openid: openid
      });
      this.getOrders();
    }).catch(err => {
      Toast(err.toString());
    })
  },
  deleteOrder(e) {
    const id = e.target.dataset.id;
    Dialog.confirm({
      message: '您确定要取消这条预约信息吗？',
      asyncClose: true
    }).then(() => {
      wx.cloud.callFunction({
        name: 'deleteFromOrders',
        data: {
          openid: this.data.openid,
          orderid: id
        }
      }).then(res => {
        console.log(res);
        if (res && res.result && res.result.stats 
          && res.result.stats.updated === 1)
        {
          const newOrderList = [];
          Object.assign(newOrderList, this.data.orders);
          let i = 0;
          for (const order of newOrderList) {
            if (order._id === id) {
              newOrderList.splice(i, 1);
              break;
            }
            i++;
          }
          this.setData({
            orders: newOrderList
          });
        }
        Dialog.close();
      }).catch(err => {
        console.log(err);
        Dialog.close();
        Toast(err.toString());
      })
    }).catch((err) => {
      Toast(err.toString());
      Dialog.close();
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
    this.initLogin();
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
    // 加载预约数据
    this.getOrders();
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