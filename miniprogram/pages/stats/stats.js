const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
import Dialog from 'vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: [],
    isAdmin: false,
    openid: '',
    hasOpenid: false,
    userInDb: false
  },
  getOrders() {
    Toast.loading({
      mask: true,
      message: '加载预约列表中.'
    });
    const $ = db.command.aggregate
    if (this.data.isAdmin) {
      // 是管理员，能看到全部的order
      db.collection('orders').aggregate()
        .match({
          status: 1
        })
        .project({
          avatar: 1,
          nickname: 1,
          phone: 1,
          _openid: 1,
          orderTime: $.dateToString({
            date: '$orderTime',
            format: '%Y-%m-%d %H:%M',
            timezone: 'Asia/Shanghai'
          })
        }).sort({
          orderTime: -1,
        }).end()
        .then(res => {
          console.log(res);
          Toast.clear();
          wx.stopPullDownRefresh();
          for (const r of res.list) {
            if (moment(r.orderTime).diff(moment()) > 0) {
              r.status = 1;
            } else {
              r.status = 2;
            }
          }
          this.setData({
            orders: res.list
          });
        }).catch(err => {
          Toast.clear();
          wx.stopPullDownRefresh();
          Toast(err.toString());
        });
    } else {
      db.collection('orders').aggregate()
        .match({
          _openid: this.data.openid,
          status: 1,
        })
        .project({
          avatar: 1,
          nickname: 1,
          phone: 1,
          _openid: 1,
          orderTime: $.dateToString({
            date: '$orderTime',
            format: '%Y-%m-%d %H:%M',
            timezone: 'Asia/Shanghai'
          })
        }).sort({
          orderTime: -1,
        }).end()
        .then(res => {
          console.log(res);
          Toast.clear();
          wx.stopPullDownRefresh();
          for (const r of res.list) {
            if (moment(r.orderTime).diff(moment()) > 0) {
              r.status = 1;
            } else {
              r.status = 2;
            }
          }
          this.setData({
            orders: res.list
          });
        }).catch(err => {
          Toast.clear();
          wx.stopPullDownRefresh();
          Toast(err.toString());
        });
    }
  },
  initLogin() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const openid = res.result.openid;
      this.setData({
        openid: openid,
        hasOpenid: true,
      });
      // 查找是否存进了数据库
      const isExist = wx.cloud.callFunction({
        name: 'isUserExistInDB',
        data: {
          openid: openid
        }
      }).then(res => {
        if (res.result.data.length > 0) {
          this.setData({
            userInDb: true
          });
          const userInDb = res.result.data[0];
          if (userInDb.isAdmin) {
            // 说明是管理员
            this.setData({
              isAdmin: true
            });
          }
          // 存在
        } else {

        }
        // 获得orders列表,这时候已经知道当前用户是否是管理员了
        this.getOrders();
      }).catch(err => {
        Toast(err.toString());
      });
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
      db.collection('orders').doc(id).update({
        data: {
          status: 0
        }
      }).then(res => {
        console.log(res);
        if (res.stats && res.stats.updated && res.stats.updated === 1) {
          // 删除成功
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
        Dialog.close();
        Toast(err.toString());
      })
    }).catch(() => {
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