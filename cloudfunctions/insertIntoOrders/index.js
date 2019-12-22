// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment');
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event.openid;
  const username = event.username;
  const phone = event.phone;
  const nickname = event.nickname;
  const avatar = event.avatar;
  const date = event.date;
  const start = event.start;
  const end = event.end;
  const endTime = moment(event.endTime).toDate() ;
  const orderTime = moment(event.orderTime).toDate();

  // 判断是否有有效的预约
  const _ = db.command
  const existOrder = await db.collection('orders').where({
    'seats.endTime': _.gt(moment().toDate())
  }).get();
  if(existOrder && existOrder.data && existOrder.data.length > 0) {
    // 有预约信息，不可以重复预约
    return {
      code: 1,
      message: '您当前有预约，不可以重复进行预约.'
    }
  } else {
    /*
    const orderId = await db.collection('orders').where({
      date: date,
      start: start,
      end: end
    }).limit(1).get();*/
    const orderInsertResult = await db.collection('orders')
    .where({
      date: date,
      start: start,
      end: end,
      seats: _.or([_.size(0), _.size(1), _.size(2), _.size(3)]) 
    })
    .update({
      data: {
        'seats': _.push([{
          openid: openid,
          username: username,
          phone: phone,
          nickname: nickname,
          avatar: avatar,
          endTime: endTime,
          orderTime: orderTime,
          status: 1
        }])
      }
    });
    return orderInsertResult;
  }
}