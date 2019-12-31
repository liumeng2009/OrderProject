// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment');
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const openid = event.openid;
  const username = event.username;
  const phone = event.phone;
  const nickname = event.nickname;
  const sex = event.sex;
  const avatar = event.avatar;
  const date = event.date;
  const start = event.start;
  const end = event.end;
  const room = event.room;
  const endTime = moment(event.endTime).toDate() ;
  const orderTime = moment(event.orderTime).toDate();

  // 判断 如果选取了一个比现在晚的时间段，也不合理
  const submitMoment = moment(date + ' ' + start + ':00+8.0', 'YYYY-MM-DD hh:mm:ss Z');
  if (moment().diff(submitMoment) > 0) {
    // 现在时间比时段的开始时间晚
    return {
      code: 1,
      message: '该时间段的治疗已开始，请您选择晚一些的时段进行预约..'
    }
  }
  // 判断是否有有效的预约
  const _ = db.command
  const existOrder = await db.collection('orders').where({
    'seats.endTime': _.gt(moment().toDate())
  }).get();
  if(existOrder && existOrder.data && existOrder.data.length < 0) {
    // 有预约信息，不可以重复预约
    return {
      code: 1,
      message: '您当前有预约，不可以重复进行预约.'
    }
  } 
  const seatCountArray = await db.collection('settings').where({
    settingName: 'roomSeats'
  }).get();
  const seatCount = room === 1 ? seatCountArray.data[0].roomSeats[1] : seatCountArray.data[0].roomSeats[0];

  const canInsertSizeArray = [];
  for(let i = 0; i<seatCount; i++) {
    canInsertSizeArray.push(_.size(i))
  }
  const orderInsertResultA = await db.collection('orders')
  .where({
    date: date,
    start: start,
    end: end,
    room: room,
    // 超过一定长度，就失败
    seats: _.or(canInsertSizeArray),
  })
  .update({
    data: {
      'seats': _.push([{
        openid: openid,
        username: username,
        phone: phone,
        sex: sex,
        nickname: nickname,
        avatar: avatar,
        endTime: endTime,
        orderTime: orderTime,
        status: 1
      }])
    }
  });
  console.log(orderInsertResultA);
  if (orderInsertResultA && orderInsertResultA.stats) {
    if (orderInsertResultA.stats.updated === 1) {
      // 成功，说明进入room成功
      return {
        code: 1,
        message: '预约成功'
      }
    } else {
      return {
        code: 0,
        message: '很抱歉，这个时间段没有合适的位置，请您选择其他时段进行预约.'
      };
    }
  } else {
    return {
      code: 0,
      message: '服务器错误.'
    };
  }
}