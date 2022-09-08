module.exports.sleep = (admin, agent) => sleep(admin, agent)
module.exports.morning = (admin, agent) => morning(admin, agent)
module.exports.living = (admin, agent) => livingSet(admin, agent)
module.exports.livingOff = (admin, agent) => livingOff(admin, agent)
module.exports.compo = (admin, agent) => compo(admin, agent)
module.exports.cd = (admin, agent) => cd(admin, agent)
module.exports.switchOn = (admin, agent) => switchOn(admin, agent)

const axios = require('axios')

async function infrared(admin, param) {
  const url = (await admin.database().ref('/url/infrared').once('value')).val()
  axios.put(url, param)
    .then((res) => console.log(res))
    .catch((error) => console.log('infrared ' + error.message))
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

async function remo(admin, urlName, param = null) {
  const remoToken = (await admin.database().ref('/remo/token').once('value')).val()
  console.log('remoToken' + remoToken)
  const url = (await admin.database().ref('/remo/url/' + urlName).once('value')).val()
  console.log('url' + url)
  axios.post(url, param, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + remoToken
    }
  }).then((res) => console.log(res))
    .catch((error) => console.log(error))
}

function createAirconParams(temp, volume) {
  var params = new URLSearchParams()
  params.append('temperature', temp)
  params.append('air_volume', volume)
  params.append('operation_mode', 'cool')
  return params
}

async function sleep(admin, agent) {
  const url = (await admin.database().ref('/url/play-sleep-music').once('value')).val()
  axios.put(url)
    .then((res) => console.log(res))
    .catch((error) => console.log('play-sleep-music ' + error.message))
  // remo(admin, 'aircon-on', createAirconParams('26', 'auto')) // 夏用
  livingOff(admin, null)
  agent.add('眠りの音楽を再生します')
}

async function switchOn(admin, agent) {
  const url = (await admin.database().ref('/url/plasmacluster').once('value')).val()
  axios.put(url, '"' + new Date() + '"')
    .then((res) => console.log(res))
    .catch((error) => console.log('infrared ' + error.message))
  agent.add('スイッチボットを操作します')
}

async function livingOff(admin, agent) {
  infrared(admin, '" ' + new Date() + ' … living:light … 1 "')
  infrared(admin, '" ' + new Date() + ' … living:fan_stop … 1 "')
  if (agent !== null) {
    agent.add('リビングの照明を操作します')
  }
}

async function livingSet(admin, agent) {
  infrared(admin, '" ' + new Date() + ' … living:fan_2 … 1 "')
  infrared(admin, '" ' + new Date() + ' … living:fan_reverse … 1 "')
  infrared(admin, '" ' + new Date() + ' … living:light … 1 "')
  if (agent !== null) {
    agent.add('リビングの照明を操作します')
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

//   remo(admin, 'aircon-on', createAirconParams('24', 'auto')) // 夏戻す用
  if (nowHoliday) {
    curtainOpen(admin)
    agent.add('照明を操作します')
  } else {
    remo(admin, 'CD')
    agent.add('CDコンポを操作します')
  }
}
