const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoading: false,
    orders: [],
    isAdmin: false,
    openid: '',
    hasOpenid: false,
    userInDb: false,
  },

  getOrders() {
    this.setData({
      showLoading: true
    });
    const $ = db.command.aggregate
    if (this.data.isAdmin) {
      // 是管理员，能看到全部的order
      db.collection('orders').aggregate()
        .project({
          avatar: 1,
          nickname: 1,
          phone: 1,
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
          for (const r of res.list) {
            if (moment(r.orderTime).diff(moment()) > 0) {
              r.status = 1;
            } else {
              r.status = 2;
            }
          }
          this.setData({
            showLoading: false,
            orders: res.list
          });
        }).catch(err => {
          this.setData({
            showLoading: true
          });
          Toast(err.toString());
        });
    } else {
      db.collection('orders').aggregate()
        .match({
          openid: this.data.openid
        })
        .project({
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
          for (const r of res.list) {
            if (moment(r.orderTime).diff(moment()) > 0) {
              r.status = 1;
            } else {
              r.status = 2;
            }
          }
          this.setData({
            showLoading: false,
            orders: res.list
          });
        }).catch(err => {
          this.setData({
            showLoading: true
          });
          Toast(err.toString());
        });
    }
  },
  initLogin() {
    // 找到openid
    Toast.loading({
      mask: true,
      message: '加载身份信息',
      duration: 0
    });
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
          // 存在
        } else {

        }
        // 获得orders列表,这时候已经知道当前用户是否是管理员了
        this.getOrders();
      }).catch(err => {
        Toast.clear();
        Toast(err.toString());
      });
    }).catch(err => {
      Toast.clear();
      Toast(err.toString());
    })
  },
  getUserList() {
    db.collection('users').get().then(res => {
      console.log(res);
      this.setData({
        users: res.data
      })
    }).catch(err => {

    });
  },
  onGotUserInfo(e) {
    console.log(e);
    // 把当前用户存进数据库
    if (!this.data.userInDb) {
      db.collection('users').add({
        data: {
          openid: this.data.openid,
          nickname: e.detail.userInfo.nickName,
          avatar: e.detail.userInfo.avatarUrl,
          isAdmin: false,
        }
      }).then(res => {
        Toast('申请成功，请等待管理员审核.');
        this.setData({
          userInDb: true,
        });
      }).catch(err => {
        wx.showToast({
          title: err.toString(),
        })
      })
    } else {
      Toast('已经申请成为管理员了，不需要再次申请.');
    }
  },
  onIsAdminChange(e) {
    const id = e.target.dataset.userid;
    console.log(e);
    console.log(id);
    const newUser = {};
    Object.assign(newUser, this.data.users[0]);
    newUser.isAdmin = false;
    this.setData({
      users: [newUser]
    });
    if (!e.detail) {
      // 置否
      db.collection('users').where({
        _id: id
      }).limit(1).get().then(res => {
        if (res.data.length > 0) {
          if (res.data[0].isManager) {
            // 是初始用户的话
            const newUserList = [];
            Object.assign(newUserList, this.data.users);
            for (const user of newUserList) {
              if (user._id === id) {
                user.isAdmin = true;
              }
            }
            this.setData({
              users: newUserList
            });
            Toast('该管理员不可被删除管理员身份.');
          } else {
            // 不是的话，可以删除管理员身份了
            db.collection('users').doc(id).update({
              data: {
                isAdmin: false,
              }
            }).then(res => {
              Toast('删除管理员身份成功.');
              // 改变this.data
              const newUserList = [];
              Object.assign(newUserList, this.data.users);
              for(const user of newUserList) {
                if (user._id === id) {
                  user.isAdmin = false;
                }
              }
              this.setData({
                users: newUserList
              });
            }).catch(err => {
              console.log(err);
            });
          }
        } else {
          Toast('该用户不存在.');
        }

      }).catch(err => {
        console.log(err);
      });
    } else {
      // 置为真
      db.collection('users').doc(id).update({
        data: {
          isAdmin: true,
        }
      }).then(res => {
        Toast('置为管理员身份成功.');
        // 改变this.data
        const newUserList = [];
        Object.assign(newUserList, this.data.users);
        for (const user of newUserList) {
          if (user._id === id) {
            user.isAdmin = true;
          }
        }
        this.setData({
          users: newUserList
        });
      }).catch(err => {
        console.log(err);
      });
    }


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
    // this.getOrders();
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