module.exports.bus_scraping = (admin, agent) => bus_scraping(admin, agent)
module.exports.setholiday = (admin, agent) => setholiday(admin, agent)
module.exports.voicetest = (admin, agent) => voicetest(admin, agent)
module.exports.discomfort = (admin, agent) => discomfort(admin, agent)

const axios = require('axios')

async function bus_scraping(admin, agent) {
  const location = agent.parameters.location['business-name']
  let param = ''
  if (location == '秋葉原') {
    param = '&data=1'
  } else if (location == '錦糸町') {
    param = '&data=2'
  } else if (location == '門前仲町') {
    param = '&data=3'
  } else {
    agent.add(location + 'は対象外です。現在バスの確認は秋葉原行き、錦糸町行き、門前仲町行きのみに対応しています。')
    return
  }

  const url = (await admin.database().ref('/url/bus_scraping').once('value')).val()
  const res = await axios.post(url, 'not_speak=true' + param)
  agent.add(location + '行きの' + res.data.message)
}

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
  axios.post(url, {
    headers: { 'Authorization': 'Bearer ' + token },
    data: {date: nowYear + '-' + nowMonth + '-' + nowDay, holiday: holiday_id, type: 'group'}
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

async function discomfort(admin, agent) {
  const url = (await admin.database().ref('/url/discomfort_index').once('value')).val()
  const res = await axios.get(url)
  agent.add(res.data.data)
}
