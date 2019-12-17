// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 置true还是置false
  const _checked = event.checked;
  // openid
  const _docid = event.docid;
  console.log(_docid);
  console.log(_checked);
  try {
    const userResult = await db.collection('users').where({
      _id: _docid
    }).limit(1).get();
    if (userResult && userResult.data.length > 0) {
      // 用户存在
      if (!_checked) { 
        if (userResult.data[0].isManager) {
          return {
            code: 1,
            message: '该管理员不可被删除管理员身份.'
          };
        } else {
          // 置否
          // 不是的话，可以删除管理员身份了
          console.log('开始删除');
          const rel = await db.collection('users').doc(_docid).update({
            data: {
              isAdmin: false,
            }
          });
          if (rel && rel.stats && rel.stats.updated && rel.stats.updated === 1) {
            return {
              code: 0,
              message: '删除管理员身份成功.',
              result: {
                isAdmin: false,
                id: _docid
              }
            };
          } else {
            return {
              code: 1,
              message: '删除管理员身份失败.'
            };
          }
        }
      } else {
        // 置true
        console.log('开始新增');
        // 置为真
        const rel = await db.collection('users').doc(_docid).update({
          data: {
            isAdmin: true,
          }
        });
        if (rel && rel.stats && rel.stats.updated && rel.stats.updated === 1) {
          return {
            code: 0,
            message: '置为管理员身份成功.',
            result: {
              isAdmin: true,
              id: _docid
            }
          };
        } else {
          return {
            code: 1,
            message: '置为管理员身份失败.'
          };
        }
      }

    } else {
      return {
        code: 1,
        message: '该用户不存在.'
      };
    }
  }catch(err) {
    console.log(err);
    return {
      code: 1,
      message: err.toString()
    };
  }
}