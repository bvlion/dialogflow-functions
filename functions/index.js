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
  intentMap.set('living', () => infrared.living(admin, agent))
  intentMap.set('livingOff', () => infrared.livingOff(admin, agent))
  intentMap.set('morning', () => infrared.morning(admin, agent))
  intentMap.set('cd', () => infrared.cd(admin, agent))
  intentMap.set('switchOn', () => infrared.switchOn(admin, agent))
  intentMap.set('setholiday', () => others.setholiday(admin, agent))
  intentMap.set('discomfort', () => others.discomfort(admin, agent))
  intentMap.set('voicetest', () => others.voicetest(admin, agent))
  intentMap.set('bus_scraping', () => others.bus_scraping(admin, agent))

  agent.handleRequest(intentMap)
})

exports.postRequestFunction = functions.https.onRequest((request, response) => {
  if (request.method !== 'POST') {
    response.status(404).send('Not post request')
  }

  const headerToken = (await admin.database().ref('/token').once('value')).val()
  if (req.get('x-auth-header')) {
    response.status(400).send('Not has Header')
  }

  const infrared = require('./intents/infrared')

  if (request.body.type == 'living_on') {
    infrared.living(admin, null)
  }
  if (request.body.type == 'living_off') {
    infrared.livingOff(admin, null)
  }

  response.status(200).send('This is post request')
})