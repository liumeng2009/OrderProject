// pages/users/users.js
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    users: []
  },
  getUserList() {
    Toast.loading({
      mask: true,
      message: '加载用户列表中.'
    });
    db.collection('users').get().then(res => {
      Toast.clear();
      wx.stopPullDownRefresh();
      this.setData({
        users: res.data
      })
    }).catch(err => {
      Toast.clear();
      wx.stopPullDownRefresh();
    });
  },
  initLogin() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const openid = res.result.openid;
      // 查找是否存进了数据库
      const isExist = wx.cloud.callFunction({
        name: 'isUserExistInDB',
        data: {
          openid: openid
        }
      }).then(res => {
        Toast.clear();
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
            this.getUserList();
          }
        } else {

        }
      }).catch(err => {
        Toast(err.toString())
      });
    }).catch(err => {
      Toast(err.toString())
    });
  },
  onIsAdminChange(e) {
    const id = e.target.dataset.userid;
    console.log(e);
    console.log(id);
    wx.cloud.callFunction({
      name: 'setUserAdmin',
      data: {
        checked: e.detail,
        docid: id
      }
    }).then(res => {
      console.log(res);
      if (res.result.code === 0) {
        // 成功, 重新绑定user列表
        if (res.result.result) {
          Toast.success('保存成功');
          const newUserList = [];
          Object.assign(newUserList, this.data.users);
          for (const user of newUserList) {
            if (user._id === res.result.result.id) {
              user.isAdmin = res.result.result.isAdmin;
            }
          }
          this.setData({
            users: newUserList
          });
        } else {
          Toast('服务器返回值错误.');
        }

      } else {
        Toast(res.message ? res.message : '保存失败.');
      }
    }).catch(err => {
      console.log(err);
      Toast(err.toString());
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
    this.getUserList();
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