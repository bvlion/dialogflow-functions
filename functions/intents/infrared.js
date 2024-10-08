module.exports.morning = (admin, execSend) => morning(admin, execSend)
module.exports.living = (admin, execSend) => livingSet(admin, execSend)
module.exports.livingOff = (admin, execSend) => livingOff(admin, execSend)
module.exports.switchOn = (admin, execSend) => switchOn(admin, execSend)

const axios = require('axios')

async function switchOn(admin, execSend) {
  const url = (await admin.database().ref('/url/switch_bot').once('value')).val()
  axios.put(url, '"' + new Date() + '"')
    .then((res) => console.log(res.config.url))
    .catch((error) => console.log('infrared ' + error.message))
  execSend('end switchBot on')
}

async function livingOff(admin, execSend) {
  const results = await remo(admin, ['fan_off', 'living_light'])

  if (results) {
    execSend('end living off')
  } else {
    execSend('error living off')
  }
}

async function livingSet(admin, execSend) {
  const fan = 'fan_1'
  // const urlNames = ['living_light', fan, 'fan_reverse', 'fan_off', fan, 'fan_reverse'] // 夏場
  const urlNames = ['living_light', fan] // 冬場

  const results = await remo(admin, urlNames)

  if (results) {
    if (execSend !== null) {
      execSend('end living on')
    }
  } else {
    if (execSend !== null) {
      execSend('error living on')
    }
  }
}

async function morning(admin, execSend) {
  await remo(admin, ['bed_room'])
  await livingSet(admin, execSend)
  // await livingSet(admin, null)
  // await checkHolidayExec(admin, execSend)
}

async function checkHolidayExec(admin, execSend) {
  const nowDate = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))
  const nowYear = nowDate.getFullYear()
  const nowMonth = nowDate.getMonth() + 1
  const nowDay = nowDate.getDate()
  let nowHoliday = nowDate.getDay() == 0 || nowDate.getDay() == 6
  
  const url = (await admin.database().ref('/holidays-webhook/get-calendar').once('value')).val()
    + nowYear + '-' + nowMonth + '-' + nowDay
  const token = (await admin.database().ref('/holidays-webhook/token').once('value')).val()
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
  console.log(`url: ${url}`)
  const res = await axios.get(url)
  console.log(`url: ${res}`)
  const data = JSON.parse(res.data.toString().match(/{.*}/))
  
  if (data !== null && data !== undefined) {
    if (data.holiday) {
      nowHoliday = true
    }
    if (data.force) {
      nowHoliday = true
    }
    console.log(`nowHoliday: ${nowHoliday}`)

    if (nowHoliday) {
      await curtainOpen(admin)
      execSend('end morning with curtain')
    } else {
      await remo(admin, ['CD'])
      execSend('end morning with CD')
    }
  } else {
    console.log(`data: ${data}`)
    console.log(`res.data: ${res.data.toString()}`)
    checkHolidayExec(admin)
  }
}

async function curtainOpen(admin) {
  const url = (await admin.database().ref('/url/curtain').once('value')).val()

  axios.post(url)
    .then((res) => console.log(res))
    .catch((error) => {
      console.log('curtain ' + error.message)
      console.log(error)
    })
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
  const waitPromise = () => new Promise(resolve => setTimeout(resolve, 1000))

  urls.forEach((value, index) => {
    if (index > 0) {
      promises.push(waitPromise)
    }
    const params = new URLSearchParams()
    if (value.slice(-5) == 'light') {
      params.append('button', 'on')
    }
    promises.push(() => axios.post(value, params, { headers: header }))
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
