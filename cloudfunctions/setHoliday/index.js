// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const _checked = event.checked;
  // openid
  const _year = event.year;
  const _month = event.month;
  const _day = event.day;
  const _ = db.command;
  try {
    if (_checked) {
      const holidayUpdateResult = await db.collection('holidays')
        .where({
          year: _year,
          holidays: _.not(_.elemMatch({
            year: _.eq(_year),
            month: _.eq(_month),
            day: _.eq(_day)
          }))
        })
        .update({
          data: {
            'holidays': _.push([{
              year: _year,
              month: _month,
              day: _day
            }])
          }
        });

      if (holidayUpdateResult && holidayUpdateResult.stats) {
        if (holidayUpdateResult.stats.updated === 1) {
          // 成功，说明进入room成功
          return {
            code: 1,
            checked: true,
            message: '新增假期成功.'
          }
        } else {
          return {
            code: 0,
            message: '当前日期已经设定为假期了.'
          };
        }
      } else {
        return {
          code: 0,
          message: '服务器错误.'
        };
      }
    } else {
      const holidayUpdateResult2 = await db.collection('holidays')
        .where({
          year: _year
        })
        .update({
          data: {
            'holidays': _.pull({
              year: _year,
              month: _month,
              day: _day
            })
          }
        });
      if (holidayUpdateResult2 && holidayUpdateResult2.stats) {
        if (holidayUpdateResult2.stats.updated === 1) {
          // 成功，说明进入room成功
          return {
            code: 1,
            checked: false,
            message: '删除假期成功.'
          }
        } else {
          return {
            code: 0,
            message: '不存在当前日期的假期信息..'
          };
        }
      } else {
        return {
          code: 0,
          message: '服务器错误.'
        };
      }
    }
  } catch (err) {
    console.log(err);
    return {
      code: 1,
      message: err.toString()
    };
  }
}