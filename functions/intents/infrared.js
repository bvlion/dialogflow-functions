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
  const fan = 'fan_2'
  const urlNames = ['living_light', fan, 'fan_reverse', 'fan_off', fan, 'fan_reverse'] // 夏場
  // const urlNames = ['living_light', fan] // 冬場

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
  const url = (await admin.database().ref('/url/morning').once('value')).val()
  axios.put(url, '"' + new Date() + '"')
    .then((res) => console.log(res.config.url))
    .catch((error) => console.log('infrared ' + error.message))
  await remo(admin, ['bed_room'])
  await livingSet(admin, execSend)
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
