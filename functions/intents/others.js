module.exports.setholiday = (admin, agent) => setholiday(admin, agent)
module.exports.voicetest = (admin, agent) => voicetest(admin, agent)
module.exports.sesame = (admin, agent) => sesame(admin, agent)

const axios = require('axios')
const aesCmac = require('node-aes-cmac').aesCmac

async function setholiday(admin, agent) {
  const dates = agent.parameters.dates
  const holidays = agent.parameters.holidays

  let holiday_id = 0
  let nowDate = new Date()

  if (dates == '明日') {
    nowDate.setDate(nowDate.getDate() + 1)
  }

  switch (holidays) {
    case '平日':
    holiday_id = 0
    break
    case '祝日':
    holiday_id = 1
    break
  }
  
  let nowYear = nowDate.getFullYear()
  let nowMonth = nowDate.getMonth() + 1
  let nowDay = nowDate.getDate()

  const url = (await admin.database().ref('/holidays-webhook/holiday-update-url').once('value')).val()
  const token = (await admin.database().ref('/holidays-webhook/token').once('value')).val()
  axios.defaults.headers.common['Authorization'] ='Bearer ' + token
  axios.post(url, {
    date: nowYear + '-' + nowMonth + '-' + nowDay,
    holiday: holiday_id,
    type: 'group'
  })
    .then((res) => console.log(res))
    .catch((error) => console.log(error))

  agent.add(dates + 'を' + holidays + 'として扱います')
}

async function voicetest(admin, agent) {
  const url = (await admin.database().ref('/url/voice-test').once('value')).val()
  const voice = agent.parameters.voice
  axios.post(url, {text: voice})
    .then((res) => console.log(res))
    .catch((error) => console.log(error))

  agent.add(voice + 'の認識をSlackに送ります。もう 1度テストしてみますか？')
}

async function sesame(admin, agent) {
  const operation = agent.parameters.operation
  const is_open = operation == '開け'
  const upper = (await admin.database().ref('/sesame/entrance-upper-lock').once('value')).val().split(',')
  const lower = (await admin.database().ref('/sesame/entrance-upper-lock').once('value')).val().split(',')
  const api_key = (await admin.database().ref('/sesame/x-api-key').once('value')).val()

  wm2_cmd(upper[0], upper[1], api_key, is_open)
  wm2_cmd(lower[0], lower[1], api_key, is_open)

  agent.add(`玄関の鍵を${operation}ました`)
}

const wm2_cmd = (sesame_id, key_secret, api_key, is_open) => {
  let cmd = 88 //(toggle:88,lock:82,unlock:83)
  if (is_open) {
    cmd = 83
  } else {
    cmd = 82
  }
  const base64_history = Buffer.from('dialogflow').toString('base64')

  const key = Buffer.from(key_secret, 'hex')
  const date = Math.floor(Date.now() / 1000)
  const dateDate = Buffer.allocUnsafe(4)
  dateDate.writeUInt32LE(date)
  const message = Buffer.from(dateDate.slice(1, 4))
  const sign = aesCmac(key, message)

  axios({
    method: 'post',
    url: `https://app.candyhouse.co/api/sesame2/${sesame_id}/cmd`,
    headers: { 'x-api-key': api_key },
    data: {
      cmd: cmd,
      history: base64_history,
      sign: sign,
    },
  })
    .then((res) => console.log(res))
    .catch((error) => console.log(error))
}