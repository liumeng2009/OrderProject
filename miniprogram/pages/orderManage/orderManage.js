// pages/orderManage/orderManage.js
const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeName: 0,
    show: false,
    minDate: moment('2019-12-01 00:00:00+8:00', "YYYY-MM-DD HH:mm:ss Z").valueOf(),
    maxDate: moment().add(1, 'year').valueOf(),
    currentDate: new Date().getTime(),
    currentDateStr: '',
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
    noOrder: false,
    nullOrders: [
      {
        id: 0,
        start: '8:00',
        end: '8:45',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      },
      {
        id: 1,
        start: '8:45',
        end: '9:30',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      },
      {
        id: 2,
        start: '9:30',
        end: '10:15',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      },
      {
        id: 3,
        start: '10:15',
        end: '11:00',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      },
      {
        id: 4,
        start: '13:00',
        end: '13:45',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      },
      {
        id: 5,
        start: '13:45',
        end: '14:30',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      },
      {
        id: 6,
        start: '14:30',
        end: '15:15',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      },
      {
        id: 7,
        start: '15:15',
        end: '16:00',
        room: [
          {
            seats: [

            ]
          },
          {
            seats: [

            ]
          }
        ]
      }
    ],
    orders: []
  },
  onChange(event) {
    this.setData({
      activeName: event.detail
    });
  },
  onDateClick() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  onDateConfirm(value) {
    this.setData({
      currentDate: value.detail,
      currentDateStr: moment(value.detail).format('YYYY年MM月DD日'),
      show: false,
    })
    this.getTimeQuantum();
  },
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
      if (res && res.data) {
        if (res.data.length > 0) {
          // 说明有这一天的数据
          const newOrder = [];
          Object.assign(newOrder, this.data.orders);
          // 将结果存入
          for (const d of res.data) {
            const idx = 0;
            if (d.room === 'a') {
              idx = 0;
            } else {
              idx = 1;
            }
            const order = newOrder.filter(o => o.start === d.start && o.end === d.end);
            if (order.length > 0) {
              for (let index = 0; index < d.seats.length; index++) {
                order[0].room[idx].seats.push(d.seats[index]);
              }
            }
          }
          console.log(newOrder);
          console.log(this.data);
          this.setData({
            orders: newOrder,
            noOrder: false
          });
        } else {
          this.setData({
            noOrder: true
          });
        }
      }
    }).catch(err => {
      console.log(err);
      wx.stopPullDownRefresh();
      Toast(err.toString());
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentDateStr: moment(this.data.currentDate).format('YYYY年MM月DD日'),
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