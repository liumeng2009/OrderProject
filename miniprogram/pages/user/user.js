const db = wx.cloud.database();
import Dialog from 'vant-weapp/dialog/dialog';
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    users: []
  },
  getUsers() {
    db.collection('users').get().then(res => {
      this.setData({
        users: [...res.data]
      });
      console.log(this.data);
    }).catch(err => {
      console.log(err);
      Toast(err.toString());
    })
  },
  onChange(e) {
    console.log(e.detail);
    const id = e.target.dataset.id;
    wx.cloud.callFunction({
      name: 'setUserAdmin',
      data: {
        docid: id,
        checked: e.detail
      }
    }).then(res => {
      console.log(res);
      if (res && res.result && res.result.code === 0) {
        const cloneUsers = [];
        Object.assign(cloneUsers, this.data.users);
        for(let cu of cloneUsers) {
          if (cu._id === id) {
            cu.isAdmin = res.result.result.isAdmin
          }
        }
        this.setData({
          users: cloneUsers
        })
        Toast(res.result.message);
      } else {
        Toast(res.result.message);
      }
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
    this.getUsers();
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