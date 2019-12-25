// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
// 云函数入口函数
// 这里可能出现的并发问题，用唯一索引处理
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const date = event.date;
  const start = event.start;
  const end = event.end;
  // a治疗室是否存在
  const existWithDateA = await db.collection('orders').where({
    date: date,
    start: start,
    end: end,
    room: 'a'
  }).get();
  if (existWithDateA && existWithDateA.data && existWithDateA.data.length > 0) {
    // 存在

  } else {
    // 不存在，需要新增一条order信息
    const addOrderA =  await db.collection('orders').add({
      data: {
        date: date,
        start: start,
        end: end,
        room: 'a',
        seats: [

        ]
      }
    });
  }
  // b治疗室是否存在
  const existWithDateB = await db.collection('orders').where({
    date: date,
    start: start,
    end: end,
    room: 'b'
  }).get();
  if (existWithDateB && existWithDateB.data && existWithDateB.data.length > 0) {

  } else {
    // 不存在，需要新增一条order信息
    const addOrderA = await db.collection('orders').add({
      data: {
        date: date,
        start: start,
        end: end,
        room: 'b',
        seats: [

        ]
      }
    });
  }
  return {
    code: 1,
    message: 'date init success'
  };
}