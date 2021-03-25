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
  } else if (location != '錦糸町') {
    param = '&data=2'
  } else if (location != '門仲' || location != '門前仲町') {
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

  let dates_id = 0
  let holiday_id = 0

  switch (dates) {
    case '今日':
    dates_id = 1
    break
    case '明日':
    dates_id = 2
    break
  }

  switch (holidays) {
    case '平日':
    holiday_id = 0
    break
    case '祝日':
    holiday_id = 1
    break
  }

  const url = (await admin.database().ref('/url/set-holiday').once('value')).val()
  axios.post(url, {date: dates_id, holiday: holiday_id})
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