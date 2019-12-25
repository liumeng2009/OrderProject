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
  const endTime = moment(event.endTime).toDate() ;
  const orderTime = moment(event.orderTime).toDate();

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
  } else {
    // 先进入roomA，如果不行，再进入roomB
    const orderInsertResultA = await db.collection('orders')
    .where({
      date: date,
      start: start,
      end: end,
      room: 'a',
      // 第二个元素存在，就不update了
      'seats.1': _.exists(false),
      // 插入元素的sex属性和第一个元素的sex属性不一样
      seats: _.or(
        _.size(0),
        _.and([
          {
            seats: _.size(1)
          },{
            'seats.0.sex': sex
          }
        ])
      )
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
        // 成功，说明进入roomA成功
        return {
          code: 1,
          room: 'a',
          message: '预约成功'
        }
      } else {
        // 不成功，那么尝试进入roomB
        const orderInsertResultB = await db.collection('orders')
        .where({
          date: date,
          start: start,
          end: end,
          room: 'b',
          // 第二个元素存在，就不update了
          'seats.1': _.exists(false),
          // 插入元素的sex属性和第一个元素的sex属性不一样
          seats: _.or(
            _.size(0),
            _.and([
              {
                seats: _.size(1)
              }, {
                'seats.0.sex': sex
              }
            ])
          )
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
        if (orderInsertResultB && orderInsertResultB.stats) {
          if (orderInsertResultB.stats.updated === 1) {
            return {
              code: 1,
              room: 'b',
              message: '预约成功'
            }
          } else {
            return {
              code: 0,
              message: '很抱歉，这个时间段没有合适的位置，请您选择其他时段进行预约.'
            };
          }
        }
      }
    } else {
      return {
        code: 0,
        message: '服务器错误.'
      };
    }
  }
}