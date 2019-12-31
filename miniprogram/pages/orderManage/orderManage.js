// pages/orderManage/orderManage.js
const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    showRoomSelector: false,
    minDate: moment('2019-12-01 00:00:00+8:00', "YYYY-MM-DD HH:mm:ss Z").valueOf(),
    maxDate: moment().add(1, 'year').valueOf(),
    currentDate: new Date().getTime(),
    currentDateStr: '',
    currentRoomStr: '电仪器治疗',
    currentRoom: 0,
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
    nullRoomDianOrders: [
      {
        id: 0,
        start: '8:00',
        end: '8:45',
        seats: [

        ]
      },
      {
        id: 1,
        start: '8:45',
        end: '9:30',
        seats: [

        ]
      },
      {
        id: 2,
        start: '9:30',
        end: '10:15',
        seats: [

        ]
      },
      {
        id: 3,
        start: '10:15',
        end: '11:00',
        seats: [

        ]
      },
      {
        id: 4,
        start: '13:00',
        end: '13:45',
        seats: [

        ]
      },
      {
        id: 5,
        start: '13:45',
        end: '14:30',
        seats: [

        ]
      },
      {
        id: 6,
        start: '14:30',
        end: '15:15',
        seats: [

        ]
      },
      {
        id: 7,
        start: '15:15',
        end: '16:00',
        seats: [

        ]
      }
    ],
    nullRoomCiOrders: [
      {
        id: 0,
        start: '8:00',
        end: '8:30',
        seats: [

        ]
      },
      {
        id: 1,
        start: '8:30',
        end: '9:00',
        seats: [

        ]
      },
      {
        id: 2,
        start: '9:00',
        end: '9:30',
        seats: [

        ]
      },
      {
        id: 3,
        start: '9:30',
        end: '10:00',
        seats: [

        ]
      },
      {
        id: 4,
        start: '10:00',
        end: '10:30',
        seats: [

        ]
      },
      {
        id: 5,
        start: '10:30',
        end: '11:00',
        seats: [

        ]
      },
      {
        id: 6,
        start: '13:00',
        end: '13:30',
        seats: [

        ]
      },
      {
        id: 7,
        start: '13:30',
        end: '14:00',
        seats: [

        ]
      },
      {
        id: 8,
        start: '14:00',
        end: '14:30',
        seats: [

        ]
      },
      {
        id: 9,
        start: '14:30',
        end: '15:00',
        seats: [

        ]
      },
      {
        id: 10,
        start: '15:00',
        end: '15:30',
        seats: [

        ]
      },
      {
        id: 11,
        start: '15:30',
        end: '16:00',
        seats: [

        ]
      }
    ],
    orders: [],
    roomSelectColumns: [
      '电仪器治疗',
      '磁仪器治疗'
    ]
  },
  onChange(event) {
    this.setData({
      activeName: event.detail
    });
  },
  onDateClick() {
    this.setData({ show: true });
  },
  onRoomClick() {
    this.setData({ showRoomSelector: true });
  },
  onRoomSelectorConfirm(e) {
    this.setData({
      currentRoom: e.detail.index,
      currentRoomStr: e.detail.value,
      showRoomSelector: false,
    })
    this.getTimeQuantum();
  },
  onClose() {
    this.setData({ show: false });
  },
  onRoomSelectorClose() {
    this.setData({ showRoomSelector: false });
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
    if (this.data.currentRoom === 1) {
      this.getRoomTimeQuantum(1)
    } else {
      this.getRoomTimeQuantum(0)
    }
  },
  getRoomTimeQuantum(roomIndex) {
    const cloneSourceOrder = roomIndex === 1 ? this.data.nullRoomCiOrders : this.data.nullRoomDianOrders
    let cloneOrder = JSON.parse(JSON.stringify(cloneSourceOrder));
    this.setData({
      orders: cloneOrder
    });
    // 获取位置情况
    db.collection('settings').where({
      settingName: 'roomSeats'
    }).get().then(res => {
      const roomSeatsCount = roomIndex === 1 ? res.data[0].roomSeats[1] : res.data[0].roomSeats[0];
      // 有没有这一天的order信息，没有的话，绑定一个空列表，有的话绑定
      const dateSelectStr = moment(this.data.currentDate).format('YYYY-MM-DD');
      db.collection('orders').where({
        date: dateSelectStr,
        room: roomIndex
      }).get().then(res => {
        console.log(res);
        if (res && res.data && res.data.length > 0) {
          // 说明有这一天的数据
          const newOrder = [];
          Object.assign(newOrder, this.data.orders);
          // 将结果存入
          for (const d of res.data) {
            const idx = 0;
            const order = newOrder.filter(o => o.start === d.start && o.end === d.end);
            if (order.length > 0) {
              for (let index = 0; index < d.seats.length; index++) {
                // 如果查看的时间是今天或者更晚，那么位置变少，就需要额外提示了
                const todayDate = moment().startOf('day');
                const timeQuanDate = moment(d.date + ' 00:00:00+8.0', 'YYYY-MM-DD hh:mm:ss Z');
                if (todayDate.diff(timeQuanDate) <= 0) {
                  if (index >= roomSeatsCount) {
                    d.seats[index].warning = true;
                  }
                }
                order[0].seats.push(d.seats[index]);
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
            orders: this.data.orders,
            noOrder: true
          });
        }
      }).catch(err => {
        console.log(err);
        Toast(err.toString());
      });
    }).catch(err => {
      console.log(err);
      Toast(err.toString());
    })
  },
  getTimeQuantumBak() {
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
          for(const no of newOrder) {
            no.seatCount = (no.room[0] ? no.room[0].seats.length : 0) + 
              (no.room[1] ? no.room[1].seats.length : 0);
          }
          console.log(newOrder);
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