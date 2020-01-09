const db = wx.cloud.database();
import Dialog from 'vant-weapp/dialog/dialog';
import Toast from 'vant-weapp/toast/toast';
const moment = require('moment');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minSeat: 0,
    maxSeat: 5,
    roomSeats: [2 ,2],
    holidays: [

    ],
    currentYear: 2020,
    showHelp: false
  },
  onSeatsChange(e) {
    const roomId = e.target.dataset.roomid;
    const seatsCount = e.detail;
    Dialog.confirm({
      title: '确认',
      message: '确定要把治疗室' + roomId + '的治疗位置改为' + seatsCount + '个吗？'
    }).then(() => {
      wx.cloud.callFunction({
        name: 'changeRoomSeats',
        data: {
          roomid:roomId,
          seatscount: seatsCount
        }
      }).then(res => {
        if (res && res.result && res.result.stats && res.result.stats.updated === 1) {
          Toast.success('修改成功.')
          if (roomId === 'a') {
            this.setData({
              roomSeats: [seatsCount, this.data.roomSeats[1]]
            })
          } else {
            this.setData({
              roomSeats: [this.data.roomSeats[0], seatsCount]
            })
          }
        } else {
          Toast.fail('修改失败.');
          this.setData({
            roomSeats: this.data.roomSeats
          });
        }
      }).catch(err => {
        console.log(err);
        Toast(err.toString());
        this.setData({
          roomSeats: this.data.roomSeats
        })
      })
    }).catch(() => {
      // on cancel
      this.setData({
        roomSeats: this.data.roomSeats
      })
    });
  },

  getRoomSeats() {
    db.collection('settings').where({
      settingName: 'roomSeats'
    }).get().then(res => {
      console.log(res);
      this.setData({
        roomSeats: res.data[0].roomSeats
      });
    }).catch(err => {
      console.log(err);
      Toast(err.toString());
    })
  },

  onDateClick(e) {
    console.log(e);
    // 需要判断出是新增还是删除
    let exist = true;
    for(let ho of this.data.holidays) {
      if (ho.id === e.detail.id) {
        // 存在
        exist = false;
      }
    }
    const m = moment(e.detail.date);
    const year = m.year();
    const day = m.date();
    const month = m.month() + 1;
    console.log(exist);
    wx.cloud.callFunction({
      name: 'setHoliday',
      data: {
        checked: exist,
        year: year,
        month: month,
        day: day
      }
    }).then(res => {
      console.log(res);
      if (res && res.result) {
        if (res.result.code === 1) {
          // 说明结果成功
          const holidayClone = [];
          Object.assign(holidayClone, this.data.holidays);
          if (res.result.checked) {
            // 新增成功
            const obj = {
              id : e.detail.id,
              style: 'background-color:#ee0a24;color:#fff;border-radius:100%;'
            }
            holidayClone.push(obj);
          } else {
            // 删除成功
            for(let i = 0; i < holidayClone.length; i++) {
              if (holidayClone[i].id === e.detail.id) {
                holidayClone.splice(i, 1);
                break;
              }
            }
          }
          console.log(holidayClone);
          this.setData({
            holidays: holidayClone
          });
        } else {
          // 这种情况一般是是假日要新增，不是假日要删除而造成的，所以自动刷一下数据
          this.getHolidays();
        }
        Toast(res.result.message ? res.result.message : '');
      } else {
        toast('服务器返回格式错误.')
      }
    }).catch(err => {
      console.log(err);
      Toast(err.toString());
    })
  },
  onMonthChange(e) {
    const currentMoment = moment(e.detail);
    const year = currentMoment.year();
    if (year !== this.data.currentYear) {
      this.setData({
        currentYear: year
      });
      this.getHolidays();
    }
  },
  getHolidays() {
    const _ = db.command;
    db.collection('holidays').where({
      year: this.data.currentYear
    }).get().then(res => {
      console.log(res);
      const data = res.data[0].holidays;
      const holidayArray = [];
      for(const d of data) {
         const obj = {
           id: '' + d.year + '-' + (d.month > 9 ? d.month : ('0' + d.month)) + '-' + (d.day > 9 ? d.day : ('0' + d.day)),
           style: 'background-color:#ee0a24;color:#fff;border-radius:100%;'
         };
         holidayArray.push(obj);
      }
      console.log(holidayArray);
      this.setData({
        holidays: holidayArray
      });
    }).catch(err => {
      console.log(err);
      Toast(err.toString());
    })
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
      currentYear: moment().year()
    })
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
    this.getRoomSeats();
    this.getHolidays();
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
    this.getRoomSeats();
    this.getHolidays();
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