const moment = require('moment');
const db = wx.cloud.database();
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formTitle: '预约',
    openid: '',
    saving: false,
    username: '刘孟',
    userNameErrorMessage: '',
    phone: '15822927208',
    phoneErrorMessage: '',
    date: null,
    start: null,
    end: null,
    show: false,
    columns: [
      '女',
      '男'
    ],
    currentSex: '女',
    currentSexIndex: 0,
  },
  onSexClick() {
    this.setData({
      show: true
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  onConfirm(e) {
    console.log(e.detail);
    const { value, index } = e.detail;
    this.setData({
      currentSex: value,
      currentSexIndex: index,
      show: false
    })
  },
  checkPhone() {
    const phoneReg = /^[1][3,4,5,7,8，9][0-9]{9}$/;
    const forbidden = phoneReg.test(this.data.phone);
    return forbidden;
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
  onUsernameInput(value) {
    if (this.data.userNameErrorMessage !== '') {
      this.setData({
        userNameErrorMessage: ''
      });
    }
    return value;
  },
  onUsernameBlur(value) {
    this.setData({
      username: value.detail.value,
    });
  },
  getUserInfo(e) {
    console.log(e.detail);
    if (this.openid === '') {
      Toast('openid初始化失败');
      return false;
    }
    if (!this.data.username || this.data.username === '') {
      this.setData({
        userNameErrorMessage: '请输入真实姓名...'
      });
      return false;
    }
    if (!this.data.phone) {
      this.setData({
        phoneErrorMessage: '请输入电话号码...'
      });
      return false;
    } else {
      if (!this.checkPhone()) {
        if (this.data.phone.toString() === '10000') {
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
      } else {
        // 电话也通过了
        this.setData({
          saving: true
        });
        // 初始化order信息
        wx.cloud.callFunction({
          name: 'createOrders',
          data: {
            date: moment(this.data.date).format('YYYY-MM-DD'),
            start: this.data.start,
            end: this.data.end
          }
        }).then(res => {
          // 只要有返回值，就认为初始化完毕
          // 开始插入数据
          const endTime = moment(moment(this.data.date).format('YYYY-MM-DD') 
            + ' ' + this.data.end + ':00+8:00', "YYYY-MM-DD HH:mm:ss Z");
          wx.cloud.callFunction({
            name: 'insertIntoOrders',
            data: {
              openid: this.data.openid,
              date: moment(this.data.date).format('YYYY-MM-DD'),
              start: this.data.start,
              end: this.data.end,
              endTime: endTime.toDate(),
              orderTime: moment().toDate(),
              username: this.data.username,
              phone: this.data.phone,
              sex: this.data.currentSexIndex,
              nickname: e.detail.userInfo.nickName,
              avatar: e.detail.userInfo.avatarUrl,
            }
          }).then(res => {
            console.log(res);
            this.setData({
              saving: false
            });
            if (res && res.result) {
              if (res.result.code === 1) {
                Toast('预约成功')
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 500);
              } else {
                Toast(res.message ? res.message : '预约失败.');
              }
            } else {
              Toast('服务器返回格式错误.');
            }
          }).catch(err => {
            console.log(err);
            this.setData({
              saving: false
            });
            Toast(err.toString());
          })
        }).catch(err => {
          this.setData({
            saving: false
          });
          Toast(err.toString())
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', data => {
      const date = data.date;
      const id = data.id;
      const start = data.start;
      const end = data.end;
      this.setData({
        formTitle: moment(date).format('YYYY年MM月DD日') + ' ' + start + '至' + end + '时段',
        date: date,
        start: start,
        end: end
      });
    });
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const openid = res.result.openid;
      this.setData({
        openid: openid
      });
    }).catch(err => {
      Toast(err.toString());
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