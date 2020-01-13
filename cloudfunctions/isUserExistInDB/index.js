// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const _openId = event.openid ? event.openid : '';
  try{
    return await db.collection('users').where({
      openid: _openId
    }).limit(1).get();
  }catch(e){
    console.log(e);
  }

}