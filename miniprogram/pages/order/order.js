// pages/order/order.js
const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    minDate: new Date().getTime() + 1000 * 60 * 30,
    maxDate: new Date().getTime() + 1000 * 60 * 30 + 1000 * 60 * 60 * 24 *365,
    currentDate: new Date().getTime() + 1000 * 60 * 30,
    currentDateStr: '',
    openid: '',
    isAdmin: false,
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      } else if (type === 'day') {
        return `${value}日`;
      }
      return value;
    },
    nullOrders: [
      {
        id: 0,
        start: '8:00',
        end: '8:45',
        seatCount: 0,
        room: [
          {
            seats: [
              {},{}
            ]
          },
          {
            seats: [
              {}, {}
            ]
          }
        ]
      },
      {
        id: 1,
        start: '8:45',
        end: '9:30',
        seatCount: 0,
        room: [
          {
            seats: [
              {}, {}
            ]
          },
          {
            seats: [
              {}, {}
            ]
          }
        ]
      },
      {
        id: 2,
        start: '9:30',
        end: '10:15',
        seatCount: 0,
        room: [
          {
            seats: [
              {}, {}
            ]
          },
          {
            seats: [
              {}, {}
            ]
          }
        ]
      },
      {
        id: 3,
        start: '10:15',
        end: '11:00',
        seatCount: 0,
        room: [
          {
            seats: [
              {}, {}
            ]
          },
          {
            seats: [
              {}, {}
            ]
          }
        ]
      }
    ],
    orders: []
  },
  onDateClick() {
    this.setData({ show: true });
  },
  onDateConfirm(value) {
    this.setData({
      currentDate: value.detail,
      currentDateStr: moment(value.detail).format('YYYY年MM月DD日'),
      show: false,
    })
    this.getTimeQuantum();
  },
  // 绑定时段列表
  getTimeQuantum() {
    // 重新初始化
    let assOrder = JSON.parse(JSON.stringify(this.data.nullOrders));
    this.setData({
      orders: assOrder
    });
    // 有没有这一天的order信息，没有的话，绑定一个空列表，有的话绑定
    const dateSelectStr = moment(this.data.currentDate).format('YYYY-MM-DD');
    db.collection('orders').where({
      date: dateSelectStr
    }).get().then(res => {
      console.log(res);
      wx.stopPullDownRefresh();
      if (res && res.data && res.data.length > 0) {
        // 说明有这一天的数据
        const newOrder = [];
        Object.assign(newOrder, this.data.orders);
        // 将结果存入
        let idx = 0;
        for(const d of res.data) {
          const order = newOrder.filter(o => o.start === d.start && o.end === d.end);
          if (order.length > 0){
            // order[0].seatCount = d.seats.length;
            for(let index = 0; index < d.seats.length ; index ++) {
              order[0].room[idx].seats[index].hasPeople = true;
              order[0].room[idx].seats[index].sex = d.seats[index].sex;
            }
          }
          idx++;
        }
        console.log(newOrder);
        console.log(this.data);
        this.setData({
          orders: newOrder
        });
      }
    }).catch(err => {
      console.log(err);
      wx.stopPullDownRefresh();
      Toast(err.toString());
    });
  },
  onClick(e) {
    const id = e.target.dataset.id;
    const start = e.target.dataset.start;
    const end = e.target.dataset.end;
    wx.navigateTo({
      url: '../orderSubmit/orderSubmit',
      success: res => {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          date: this.data.currentDate,
          id: id,
          start: start,
          end: end
        })
      }
    })
  },

  onClose() {
    this.setData({ show: false });
  },

  onSettingClick() {
    wx.navigateTo({
      url: '../orderManage/orderManage',
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentDateStr: moment(this.data.currentDate).format('YYYY年MM月DD日'),
    });
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const openid = res.result.openid;
      wx.cloud.callFunction({
        name: 'isUserExistInDB',
        data: {
          openid: openid
        }
      }).then(res => {
        if (res.result.data.length > 0 && res.result.data[0].isAdmin) {
          this.setData({
            isAdmin: true
          });
        }
      }).catch(err => {
        Toast(err.toString());
      });
      this.setData({
        openid: openid
      });
    }).catch(err => {
      Toast(err.toString());
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
    this.getTimeQuantum();
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
    this.getTimeQuantum();
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