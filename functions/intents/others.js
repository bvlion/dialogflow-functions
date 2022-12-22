module.exports.setholiday = (admin, agent) => setholiday(admin, agent)
module.exports.voicetest = (admin, agent) => voicetest(admin, agent)
module.exports.sesame = (admin, agent) => sesame(admin, agent)

const axios = require('axios')

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
  const is_open = operation == '開け' ? 83 : 82
  const url = (await admin.database().ref('/url/sesame').once('value')).val()
  axios.put(url, '"' + is_open + ' ' + new Date() + '"')
    .then((res) => console.log(res))
    .catch((error) => console.log('sesame ' + error.message))
  agent.add(`玄関の鍵を${operation}ました`)
}