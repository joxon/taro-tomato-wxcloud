const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const users = db.collection('users')

// index.js 是入口文件，云函数被调用时会执行该文件导出的 main 方法
// event 包含了调用端（小程序端）调用该函数时传过来的参数，
// 同时还包含了可以通过 getWXContext 方法获取的用户登录态 `openId` 和小程序 `appId` 信息
// 云函数的传入参数有两个，一个是 event 对象，一个是 context 对象。
// event 指的是触发云函数的事件，当小程序端调用云函数时，
// event 就是小程序端调用云函数时传入的参数，外加后端自动注入的小程序用户的 openid 和小程序的 appid。
// context 对象包含了此处调用的调用信息和运行状态，可以用它来了解服务运行的情况。
exports.main = async (event, context) => {
  try {
    const {
      OPENID
    } = cloud.getWXContext()

    const user = users.where({
      "_openid": OPENID
    })

    const result = await user.field({
      tasks: true
    }).get()

    const len = result.data.length
    if (len === 1) {
      const tasks = result.data[0].tasks
      // console.log('tasks', tasks)

      const task = event.task
      // console.log('event', event)
      // console.log('task', task)

      tasks.push(task)
      // console.log('tasks', tasks)

      return await user.update({
        data: {
          tasks
        }
      })

      // const result2 = await user.update({
      //   tasks
      // })
      // if (result2.stats.updated === 1) {
      //   return 'ok'
      // } else {
      //   return 'err'
      // }

    } else {
      throw Error('addTask: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}