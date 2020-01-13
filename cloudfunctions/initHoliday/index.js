// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const _year = event.year;
  // 先插入年份
  try{
    const insertResult = await db.collection('holidays').add({
      data: {
        year: _year,
        holidays: []
      }
    });
  }catch(e) {
    console.log(e);
  }
  // 然后初始化数据
  const mStart = moment(_year + '-01-01 00:00:00+8:00','YYYY-MM-DD HH:mm:ss Z');
  const holidayArray = [];
  console.log(mStart.toDate());
  console.log(mStart.year());
  console.log(_year);
  while(mStart.year() === _year) {
    console.log(mStart.day());
    if (mStart.day() === 0 || mStart.day() === 6) {
      // 是周六或者周日
      const obj = {
        year: mStart.year(),
        month: mStart.month() + 1,
        day: mStart.date()
      }
      holidayArray.push(obj);
    }
    mStart.add(1, 'day');
  }

  const updateResult = await db.collection('holidays').where({
    year: _year
  }).update({
    data: {
      holidays: holidayArray
    }
  });

  if (updateResult && updateResult.stats) {
    if (updateResult.stats.updated === 1) {
      return {
        code: 1,
        message: '初始化成功'
      }
    } else {
      return {
        code: 0,
        message: '初始化失败'
      }
    }
  } else {
    return {
      code: 0,
      message: '初始化失败'
    }
  }
}