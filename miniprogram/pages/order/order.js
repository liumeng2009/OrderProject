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
    showHelp: false,
    showRoomSelector: false,
    hasTimeQuantum: true,
    minDate: new Date().getTime() + 1000 * 60 * 30,
    maxDate: new Date().getTime() + 1000 * 60 * 30 + 1000 * 60 * 60 * 24 *365,
    currentDate: new Date().getTime() + 1000 * 60 * 30,
    currentDateStr: '',
    currentRoomStr: '生物反馈电刺激',
    currentRoom: 0,
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
    showSetting: false,
    columns: [
      '预约管理',
      '用户管理',
      '业务设置'
    ],
    roomSelectColumns: [
      '生物反馈电刺激',
      '盆底磁刺激'
    ],
    isHoliday: false
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
  // 绑定时段列表
  getTimeQuantum() {
    // 先判断是否是假日
    const m = moment(this.data.currentDate);
    const year = m.year();
    const month = m.month() + 1;
    const day = m.date();
    db.collection('holidays').where({
      year: year,
      holidays: {
        year: year,
        month: month,
        day: day
      }
    }).get().then(res => {
      console.log(res);
      if (res && res.data && res.data.length > 0) {
        // 是假期
        this.setData({
          isHoliday: true
        })
      } else {
        this.setData({
          isHoliday: false
        })
      }
      //然后绑定数据
      if (this.data.currentRoom === 1) {
        this.getRoomTimeQuantum(1)
      } else {
        this.getRoomTimeQuantum(0)
      }
    }).catch(err => {
      console.log(err);
      Toast(err.toString());
    });
  },
  getRoomTimeQuantum(roomIndex) {
    const cloneSourceOrder = roomIndex === 1 ? this.data.nullRoomCiOrders : this.data.nullRoomDianOrders
    let cloneOrder = JSON.parse(JSON.stringify(cloneSourceOrder));
    const useOrder = [];
    // 删去超过现在时间的
    for (let co of cloneOrder) {
      const coMoment = moment(this.data.currentDateStr + ' ' + co.start + ':00+8.00', 'YYYY年MM月DD日 hh:mm:ss Z');
      if (moment().diff(coMoment) < 0) {
        useOrder.push(co);
      }
    }
    let hasTimeQuan = true;
    if (useOrder.length === 0) {
      hasTimeQuan = false
    } else {
      hasTimeQuan = true
    }
    this.setData({
      orders: useOrder,
      hasTimeQuantum: hasTimeQuan
    });
    // 获取位置情况
    db.collection('settings').where({
      settingName: 'roomSeats'
    }).get().then(res => {
      const roomSeatsCount = roomIndex === 1 ? res.data[0].roomSeats[1] : res.data[0].roomSeats[0];
      // 初始化位置
      for (const o of this.data.orders) {
        for (let index = 0; index < roomSeatsCount; index++) {
          o.seats.push({hasPeople: false});
        }
      }
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
                // 由于是预约，可能会存在先前的预约多，现在机器少了，人数多于位置数的情况，对于用户来说，只看到实际位置数
                if (order[0].seats[index]) {
                  order[0].seats[index].hasPeople = true;
                  order[0].seats[index].sex = d.seats[index].sex;
                }
              }
            }
          }
          console.log(newOrder);
          console.log(this.data);
          this.setData({
            orders: newOrder
          });
        } else {
          this.setData({
            orders: this.data.orders
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
          end: end,
          room: this.data.currentRoom
        })
      }
    })
  },

  onClose() {
    this.setData({ show: false });
  },
  onRoomSelectorClose() {
    this.setData({ showRoomSelector: false });
  },
  onSettingClick() {
    this.setData({
      showSetting: true,
    })

  },
  onSettingClose() {
    this.setData({
      showSetting: false,
    })
  },
  onSettingConfirm(e) {
    const { value, index } = e.detail;
    switch(index) {
      case 0:
        wx.navigateTo({
          url: '../orderManage/orderManage',
        });
        break;
      case 1:
        wx.navigateTo({
          url: '../user/user',
        });
        break;
      case 2:
        wx.navigateTo({
          url: '../setting/setting',
        });
        break;
      default:
        wx.navigateTo({
          url: '../orderManage/orderManage',
        });
        break;
    }
    this.setData({
      showSetting: false
    });
  },
  onShowHelp() {
    this.setData({
      showHelp: true
    });
  },
  onCloseHelp() {
    this.setData({
      showHelp: false
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