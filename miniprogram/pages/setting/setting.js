const db = wx.cloud.database();
import Dialog from 'vant-weapp/dialog/dialog';
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minSeat: 0,
    maxSeat: 5,
    roomSeats: [2 ,2]
  },
  onSeatsChange(e) {
    const roomId = e.target.dataset.roomid;
    const roomStr = roomId === 'a' ? '电仪器治疗室' : '磁仪器治疗室';
    const seatsCount = e.detail;
    Dialog.confirm({
      title: '确认',
      message: '确定要把' + roomStr + '的治疗位置改为' + seatsCount + '个吗？'
    }).then(() => {
      Toast.loading({ forbidClick: true });
      wx.cloud.callFunction({
        name: 'changeRoomSeats',
        data: {
          roomid:roomId,
          seatscount: seatsCount
        }
      }).then(res => {
        if (res && res.result && res.result.stats && res.result.stats.updated === 1) {
          Toast.clear();
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
          Toast.clear()
        }
      }).catch(err => {
        console.log(err);
        Toast.clear()
      })
    }).catch(() => {
      // on cancel
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
    this.getRoomSeats();
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