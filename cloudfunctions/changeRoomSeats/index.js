// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const roomid = event.roomid;
  const seatscount = event.seatscount;
  const _ = db.command;
  if (roomid === 'a') {
    return await db.collection('settings').where({
      settingName: 'roomSeats'
    }).update({
      data: {
        'roomSeats.0': seatscount
      }
    });
  } else {
    return await db.collection('settings').where({
      settingName: 'roomSeats'
    }).update({
      data: {
        'roomSeats.1': seatscount
      }
    });
  }
}