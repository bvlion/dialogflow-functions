module.exports.sleep = (admin, agent) => sleep(admin, agent)
module.exports.morning = (admin, agent) => morning(admin, agent)
module.exports.compo = (admin, agent) => compo(admin, agent)
module.exports.cd = (admin, agent) => cd(admin, agent)

const axios = require('axios')

async function infrared(admin, param) {
  const url = (await admin.database().ref('/url/infrared').once('value')).val()
  axios.put(url, param)
    .then((res) => console.log(res))
    .catch((error) => console.log('infrared ' + error.message))
}

async function curtainOpen(admin) {
  const url = (await admin.database().ref('/url/curtain').once('value')).val()
  axios.put(url, '"open ' + new Date() + '"')
    .then((res) => console.log(res))
    .catch((error) => console.log('curtain ' + error.message))
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
  remo(admin, 'aircon-on', createAirconParams('26', '2')) // 夏用
  infrared(admin, '" ' + new Date() + ' … living:light … 1 "')
  infrared(admin, '" ' + new Date() + ' … living:fan_stop … 1 "')
  agent.add('眠りの音楽を再生します')
}

async function morning(admin, agent) {
  infrared(admin, '" ' + new Date() + ' … living:light … 1 "')
  infrared(admin, '" ' + new Date() + ' … living:fan_1 … 1 "')
  const url = (await admin.database().ref('/url/time-notification').once('value')).val()
  console.log('target url: ' + url)
  const res = await axios.get(url)
  const target = res.data
  console.log('target res: ' + res)
  console.log('target val: ' + target)
  remo(admin, 'aircon-on', createAirconParams('24', 'auto')) // 夏戻す用
  if (target == 1) {
    remo(admin, 'CD')
    agent.add('CDコンポを操作します')
  } else {
    curtainOpen(admin)
    agent.add('照明を操作します')
  }
}
