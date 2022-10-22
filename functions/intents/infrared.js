module.exports.morning = (admin, agent) => morning(admin, agent)
module.exports.living = (admin, agent, execSend) => livingSet(admin, agent, execSend)
module.exports.livingOff = (admin, agent, execSend) => livingOff(admin, agent, execSend)
module.exports.cd = (admin, agent) => cd(admin, agent)
module.exports.switchOn = (admin, agent) => switchOn(admin, agent)

const axios = require('axios')

// async function infrared(admin, param) {
//   const url = (await admin.database().ref('/url/infrared').once('value')).val()
//   axios.put(url, param)
//     .then((res) => console.log(res))
//     .catch((error) => console.log('infrared ' + error.message))
// }

async function curtainOpen(admin) {
  const url = (await admin.database().ref('/url/curtain').once('value')).val()

  axios.post(url)
    .then((res) => console.log(res))
    .catch((error) => {
      console.log('curtain ' + error.message)
      console.log(error)
    })
}

async function switchOn(admin, agent) {
  const url = (await admin.database().ref('/url/plasmacluster').once('value')).val()
  axios.put(url, '"' + new Date() + '"')
    .then((res) => console.log(res))
    .catch((error) => console.log('infrared ' + error.message))
  agent.add('スイッチボットを操作します')
}

async function livingOff(admin, agent, execSend) {
  const results = await remo(admin, ['fan_off', 'living_light'])

  if (results) {
    if (agent !== null) {
      agent.add('リビングの照明を操作します')
    }
    if (execSend !== null) {
      execSend('end living off')
    }
  } else {
    if (agent !== null) {
      agent.add('エラーが発生したようです')
    }
    if (execSend !== null) {
      execSend('error living off')
    }
  }
}

async function livingSet(admin, agent, execSend) {
  const fan = 'fan_1'
  // const urlNames = ['living_light', fan, 'fan_reverse', 'fan_off', fan, 'fan_reverse'] // 夏場
  const urlNames = ['living_light', fan] // 冬場

  const results = await remo(admin, urlNames)

  if (results) {
    if (agent !== null) {
      agent.add('リビングの照明を操作します')
    }
    if (execSend !== null) {
      execSend('end living on')
    }
  } else {
    if (agent !== null) {
      agent.add('エラーが発生したようです')
    }
    if (execSend !== null) {
      execSend('error living on')
    }
  }
}

async function morning(admin, agent) {
  livingSet(admin, null)

  const nowDate = new Date()
  const nowYear = nowDate.getFullYear()
  const nowMonth = nowDate.getMonth() + 1
  const nowDay = nowDate.getDate()
  let nowHoliday = nowDate.getDay() == 0 || nowDate.getDay() == 6

  const url = (await admin.database().ref('/holidays-webhook/get-calendar').once('value')).val()
    + nowYear + '-' + nowMonth + '-' + nowDay
  const token = (await admin.database().ref('/holidays-webhook/token').once('value')).val()
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
  const res = await axios.get(url)
  if (res.data.holiday) {
    nowHoliday = true;
  }
  if (res.data.force) {
    nowHoliday = true;
  }

  if (nowHoliday) {
    curtainOpen(admin)
    agent.add('照明を操作します')
  } else {
    await remo(admin, ['CD'])
    agent.add('CDコンポを操作します')
  }
}

const remo = async (admin, urlNames) => {
  const remoToken = (await admin.database().ref('/remo/token').once('value')).val()
  const header = {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + remoToken
  }

  const urlPromises = urlNames.map((urlName) => 
    admin.database().ref('/remo/url/' + urlName).once('value')
      .then((snapshot) => snapshot.val())
      .catch((err) => {
        console.log(err)
      })
  )

  let urls = []
  await Promise.all(urlPromises)
    .then((url) => urls = url)
    .catch((err) => {
      console.log(err)
    }) 

  const promises = []
  const waitPromise = () => new Promise(resolve => setTimeout(resolve, 800))

  urls.forEach((value, index) => {
    if (index > 0) {
      promises.push(waitPromise)
    }
    promises.push(() => axios.post(value, null, { headers: header }))
  })

  const results = await sequential(promises)
  return results
}

const sequential = async (promises) => {
  const first = promises.shift()
  if (first === null) {
    return []
  }

  const results = []
  await promises
    .concat(() => Promise.resolve())
    .reduce(async (prev, next) => {
      const res = await prev
      results.push(res)
      return next()
    }, Promise.resolve(first()))

  return results
}