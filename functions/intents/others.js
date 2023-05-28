module.exports.setHolidayVoice = (admin, agent) => setHolidayVoice(admin, agent)
module.exports.setTodayHoliday = (admin, execSend) => setTodayHoliday(admin, execSend)
module.exports.setTodayWeekday = (admin, execSend) => setTodayWeekday(admin, execSend)
module.exports.setTomorrowHoliday = (admin, execSend) => setTomorrowHoliday(admin, execSend)
module.exports.setTomorrowWeekday = (admin, execSend) => setTomorrowWeekday(admin, execSend)
module.exports.voicetest = (admin, agent) => voicetest(admin, agent)
module.exports.sesame = (admin, agent) => sesame(admin, agent)
module.exports.sesameOpen = (admin, execSend) => sesameOpen(admin, execSend)
module.exports.sesameClose = (admin, execSend) => sesameClose(admin, execSend)

const axios = require('axios')

async function setHolidayVoice(admin, agent) {
  const dates = agent.parameters.dates
  const holidays = agent.parameters.holidays

  let holiday_id = 0

  switch (holidays) {
    case '平日':
    holiday_id = 0
    break
    case '祝日':
    holiday_id = 1
    break
  }

  setHoliday(admin, holiday_id, dates == '明日')

  agent.add(dates + 'を' + holidays + 'として扱います')
}

async function setTodayHoliday(admin, execSend) {
  setHoliday(admin, 1, false)
  execSend('setTodayHoliday')
}

async function setTodayWeekday(admin, execSend) {
  setHoliday(admin, 0, false)
  execSend('setTodayWeekday')
}

async function setTomorrowHoliday(admin, execSend) {
  setHoliday(admin, 1, true)
  execSend('setTomorrowHoliday')
}

async function setTomorrowWeekday(admin, execSend) {
  setHoliday(admin, 0, true)
  execSend('setTomorrowWeekday')
}

async function setHoliday(admin, holiday_id, addDate) {
  let nowDate = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))

  if (addDate) {
    nowDate.setDate(nowDate.getDate() + 1)
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
  sesameLocal(admin, operation == '開け' ? 83 : 82)
  agent.add(`玄関の鍵を${operation}ました`)
}

async function sesameOpen(admin, execSend) {
  sesameLocal(admin, 83)
  execSend('sesameOpen')
}

async function sesameClose(admin, execSend) {
  sesameLocal(admin, 82)
  execSend('sesameClose')
}

async function sesameLocal(admin, openCode) {
  const url = (await admin.database().ref('/url/sesame').once('value')).val()
  axios.put(url, '"' + openCode + ' ' + new Date() + '"')
    .then((res) => console.log(res))
    .catch((error) => console.log('sesame ' + error.message))
}