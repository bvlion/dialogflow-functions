module.exports.sleep = (admin, agent) => sleep(admin, agent)
module.exports.morning = (admin, agent) => morning(admin, agent)
module.exports.compo = (admin, agent) => compo(admin, agent)
module.exports.cd = (admin, agent) => cd(admin, agent)

const axios = require('axios')

async function infrared(admin, param) {
  const url = (await admin.database().ref('/url/infrared').once('value')).val()
  axios.put(url, param)
    .then((res) => console.log(res))
    .catch((error) => console.log('time-notification ' + error.message))
}

async function sleep(admin, agent) {
  infrared(admin, '" ' + new Date() + ' … room:power … 2 "')
  const url = (await admin.database().ref('/url/play-sleep-music').once('value')).val()
  axios.put(url)
    .then((res) => console.log(res))
    .catch((error) => console.log('time-notification ' + error.message))
  // 夏は「 aircon:cool28sleep 」
  infrared(admin, '" ' + new Date() + ' … living:light … 1 "')
  agent.add('眠りの音楽を再生します')
}

async function morning(admin, agent) {
  infrared(admin, '" ' + new Date() + ' … room:power … 1 "')
  const url = (await admin.database().ref('/url/time-notification').once('value')).val()
  const res = await axios.get(url)
  if (res.data == 1) {
    infrared(admin, '" ' + new Date() + ' … compo:cd … 1 "')
    agent.add('CDコンポを操作します')
  } else {
    infrared(admin, '" ' + new Date() + ' … aircon:hot20 … 1 "')
    agent.add('暖房を二十度で起動します')
  }
}

function compo(admin, agent) {
  infrared(admin, '" ' + new Date() + ' … compo:power … 1 "')
  agent.add('コンポの電源を操作します')
}

function cd(admin, agent) {
  infrared(admin, '" ' + new Date() + ' … compo:cd … 1 "')
  agent.add('CDコンポを操作します')
}