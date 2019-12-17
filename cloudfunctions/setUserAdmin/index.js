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
  try {
    if (!e.detail) {
      // 置否
      db.collection('users').where({
        _id: _docid
      }).limit(1).get().then(res => {
        if (res.data.length > 0) {
          if (res.data[0].isManager) {
            // 是初始用户的话
            return {
              code:1,
              message: '该管理员不可被删除管理员身份.'
            };
          } else {
            // 不是的话，可以删除管理员身份了
            db.collection('users').doc(_docid).update({
              data: {
                isAdmin: false,
              }
            }).then(res => {
              return {
                code: 0,
                message: '删除管理员身份成功.'
              };
            }).catch(err => {
              return {
                code: 1,
                message: '数据库操作失败.'
              };
            });
          }
        } else {
          return {
            code: 1,
            message: '该用户不存在.'
          };
        }

      }).catch(err => {
        return {
          code: 1,
          message: '数据库操作失败.'
        };
      });
    } else {
      // 置为真
      db.collection('users').doc(_docid).update({
        data: {
          isAdmin: true,
        }
      }).then(res => {
        return {
          code: 0,
          message: '置为管理员身份成功.'
        };
      }).catch(err => {
        return {
          code: 1,
          message: '操作数据库失败.'
        };
      });
    }
  } catch (e) {
    return {
      code: 1,
      message: '服务器内部异常.'
    };
  }
}