'use strict'

const functions = require('firebase-functions')
const admin = require('firebase-admin')
if (process.env.LOCAL_DATABASE_URL) {
  admin.initializeApp({
    databaseURL: process.env.LOCAL_DATABASE_URL,
  })
} else {
  admin.initializeApp(functions.config().firebase)
}

exports.postRequestFunction = functions.https.onRequest((request, response) => {
  if (request.method !== 'POST') {
    response.status(404).send('Not post request')
    return
  }
  asyncProcess(admin, request, response)
})

async function asyncProcess(admin, request, response) {
  const headerToken = (await admin.database().ref('/token').once('value')).val()

  if (headerToken != request.get('x-auth-header')) {
    response.status(400).send('Not has Header')
    return
  }

  const infrared = require('./intents/infrared')
  const other = require('./intents/others')
  const execSend = function (msg) {
    response.status(200).send(msg)
  }

  if (request.body.type == 'living_on') {
    infrared.living(admin, execSend)
  } else if (request.body.type == 'living_off') {
    infrared.livingOff(admin, execSend)
  } else if (request.body.type == 'morning') {
    infrared.morning(admin, execSend)
  } else if (request.body.type == 'switch_on') {
    infrared.switchOn(admin, execSend)
  } else if (request.body.type == 'set_today_holiday') {
    other.setTodayHoliday(admin, execSend)
  } else if (request.body.type == 'set_today_weekday') {
    other.setTodayWeekday(admin, execSend)
  } else if (request.body.type == 'set_tomorrow_holiday') {
    other.setTomorrowHoliday(admin, execSend)
  } else if (request.body.type == 'set_tomorrow_weekday') {
    other.setTomorrowWeekday(admin, execSend)
  } else if (request.body.type == 'sesame_open') {
    other.sesameOpen(admin, execSend)
  } else if (request.body.type == 'sesame_close') {
    other.sesameClose(admin, execSend)
  } else {
    execSend('This is post request')
  }
}