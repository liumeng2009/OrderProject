// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const openid = event.openid;
  const orderid = event.orderid;
  const _ = db.command
  return await db.collection('orders').doc(orderid)
    .update({
      data: {
        'seats': _.pull({
          openid: openid
        })
      }
    })
}