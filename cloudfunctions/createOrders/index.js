// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const date = event.date;
  const start = event.start;
  const end = event.end;
  const existWithDate = await db.collection('orders').where({
    date: date,
    start: start,
    end: end
  }).get();
  if (existWithDate && existWithDate.data && existWithDate.data.length > 0) {
    // 存在
    return {
      code: 1,
      message: 'exist.'
    };
  } else {
    // 不存在，需要新增一条order信息
    return await db.collection('orders').add({
      data: {
        date: date,
        start: start,
        end: end,
        seats: [

        ]
      }
    });
  }
}