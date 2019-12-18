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
    saving: false,
    minDate: new Date().getTime() + 1000 * 60 * 30,
    maxDate: new Date().getTime() + 1000 * 60 * 30 + 1000 * 60 * 60 * 24 *365,
    currentDate: new Date().getTime() + 1000 * 60 * 30,
    currentDateStr: '',
    phone: null,
    phoneErrorMessage: '',
    openid: '',
    isManager: false
  },
  onDateClick() {
    this.setData({ show: true });
  },
  onDateConfirm(value) {
    this.setData({
      currentDate: value.detail,
      currentDateStr: moment(value.detail).format('YYYY年MM月DD日 hh:mm'),
      show: false,
    })
  },
  checkPhone() {
    const phoneReg = /^[1][3,4,5,7,8，9][0-9]{9}$/;
    const forbidden = phoneReg.test(this.data.phone);
    return forbidden;
  },
  onClose() {
    this.setData({ show: false });
  },
  onPhoneInput(value) {
    if (this.data.phoneErrorMessage !== '') {
      this.setData({
        phoneErrorMessage: ''
      });
    }
    return value;
  },
  onPhoneBlur(value) {
    this.setData({
      phone: value.detail.value,
    });
  },

  onGotUserInfo(e) {
    if (this.openid === '') {
      Toast('openid初始化失败');
      return false;
    }
    if (!this.data.phone) {
      this.setData({
        phoneErrorMessage: '请输入电话号码...'
      });
      return false;
    } else {
      if (!this.checkPhone()) {
        if (this.data.phone.toString() === '10000'){
          // 约定，这样输入的用户，想成为管理员，把他存入users表
          wx.cloud.callFunction({
            name: 'isUserExistInDB',
            data: {
              openid: this.data.openid
            }
          }).then(res => {
            if (res.result.data.length > 0) {
              // 已经存在
              Toast('您已经申请成为管理员了.');
            } else {
              // 不存在，需要新增users信息
              db.collection('users').add({
                data: {
                  openid: this.data.openid,
                  nickname: e.detail.userInfo.nickName,
                  avatar: e.detail.userInfo.avatarUrl,
                  isAdmin: false,
                }
              }).then(res => {
                Toast('申请成功，请等待管理员审核.');
              }).catch(err => {
                Toast(err.toString());
              })
            }
          }).catch(err => {
            Toast(err.toString());
          })

        } else {
          this.setData({
            phoneErrorMessage: '电话号码格式错误...'
          });
          return false;
        }
      }
    }

    // 时间不可以太晚，需要比现在早30分钟
    if (moment(this.data.currentDate).diff(moment()) >= 0) {

    } else {
      Toast('请选择一个比现在更晚的时间.');
      return false;
    }
    this.setLoading(true);
    const _ = db.command
    // 检查这个用户是否有生效中的预约
    console.log(this.data.openid);
    console.log(moment().toDate());
    db.collection('orders').where({
      _openid: this.data.openid,
      orderTime: _.gt(moment().toDate())
    }).get().then(res => {
      if (res.data.length > 0) {
        // 说明有，不可以重复预约
        Toast('您已经有预约了，不可以重复预约.');
        this.setLoading(false);
        return false;
      } else {
        // 如果没有其他预约，才可以新增
        // 把当前用户存进数据库
        db.collection('orders').add({
          data: {
            orderTime: moment(this.data.currentDate).toDate(),
            phone: this.data.phone,
            status: 1,
            nickname: e.detail.userInfo.nickName,
            avatar: e.detail.userInfo.avatarUrl,
          }
        }).then(res => {
          this.setLoading(false);
          Toast.success('预约成功');
          this.setData({
            phone: null
          });
        }).catch(err => {
          this.setLoading(false);
          Toast(err.toString());
        })
      }
    }).catch(err => {
      Taost(err.toString());
      this.setLoading(false);
    })
  },

  setLoading(value) {
    this.setData({
      saving: value
    });
  },
  onUserManageClick() {
    wx.navigateTo({
      url: '../users/users',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentDateStr: moment(this.data.currentDate).format('YYYY年MM月DD日 hh:mm'),
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
        if (res.result.data.length > 0 && res.result.data[0].isManager) {
          this.setData({
            isManager: true
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