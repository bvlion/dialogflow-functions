'use strict'

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
const {WebhookClient} = require('dialogflow-fulfillment')

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response })

  let intentMap = new Map()
  const infrared = require('./intents/infrared')
  const others = require('./intents/others')

  intentMap.set('save', () => require('./intents/save')(admin, agent))
  intentMap.set('living', () => infrared.living(admin, agent, null))
  intentMap.set('livingOff', () => infrared.livingOff(admin, agent, null))
  intentMap.set('morning', () => infrared.morning(admin, agent))
  intentMap.set('cd', () => infrared.cd(admin, agent))
  intentMap.set('switchOn', () => infrared.switchOn(admin, agent))
  intentMap.set('setholiday', () => others.setholiday(admin, agent))
  intentMap.set('voicetest', () => others.voicetest(admin, agent))

  agent.handleRequest(intentMap)
})

exports.postRequestFunction = functions.https.onRequest((request, response) => {
  if (request.method !== 'POST') {
    response.status(404).send('Not post request')
  }
  asyncProcess(admin, request, response)
})

async function asyncProcess(admin, request, response) {
  const headerToken = (await admin.database().ref('/token').once('value')).val()

  if (headerToken != request.get('x-auth-header')) {
    response.status(400).send('Not has Header')
  }

  const infrared = require('./intents/infrared')
  const execSend = function (msg) {
    response.status(200).send(msg)
  }

  if (request.body.type == 'living_on') {
    infrared.living(admin, null, execSend)
  } else if (request.body.type == 'living_off') {
    infrared.livingOff(admin, null, execSend)
  } else {
    execSend('This is post request')
  }
}