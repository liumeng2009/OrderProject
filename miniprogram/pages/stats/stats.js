const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
import Dialog from 'vant-weapp/dialog/dialog';
Page({
  data: {
    checked: false,
    orders: [],
    openid: '',
    noOrder: false
  },
  onChange(e) {
    this.setData({ checked: e.detail });
    this.getOrders(e.detail);
  },
  getOrders(isAll) {
    const _ = db.command;
    let whereObj = {};
    if (isAll) {
      whereObj = {
        'seats.openid': this.data.openid
      }
    } else {
      whereObj = {
        'seats.openid': this.data.openid,
        'seats.endTime': _.gt(moment().toDate())
      }
    }
    db.collection('orders').where(whereObj).orderBy('date', 'desc').get()
    .then(res => {
      console.log(res);
      wx.stopPullDownRefresh();
      if (res && res.data && res.data.length > 0) {

      } else {
        this.setData({
          noOrder: true
        })
      }
      this.setData({
        orders: res.data
      });
    }).catch(err => {
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
      this.getOrders(this.data.checked);
    }).catch(err => {
      Toast(err.toString());
    })
  },
  deleteOrder(e) {
    const id = e.target.dataset.id;
    const date = e.target.dataset.date;
    const start = e.target.dataset.start;
    const end = e.target.dataset.end;
    // 取消，必须提前两小时
    const startTime = moment(moment(date).format('YYYY-MM-DD')
      + ' ' + start + ':00+8:00', "YYYY-MM-DD HH:mm:ss Z");
    if (startTime.diff(moment()) < 1000 * 60 * 60 * 2){
      // 小于两小时
      Toast('抱歉，取消预约需提前两小时进行.');
      return false;
    }

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
          Toast('取消预约成功.');
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
    this.getOrders(this.data.checked);
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