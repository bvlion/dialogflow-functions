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
  intentMap.set('sleep', () => infrared.sleep(admin, agent))
  intentMap.set('living', () => infrared.living(admin, agent))
  intentMap.set('morning', () => infrared.morning(admin, agent))
  intentMap.set('compo', () => infrared.compo(admin, agent))
  intentMap.set('cd', () => infrared.cd(admin, agent))
  intentMap.set('setholiday', () => others.setholiday(admin, agent))
  intentMap.set('discomfort', () => others.discomfort(admin, agent))
  intentMap.set('voicetest', () => others.voicetest(admin, agent))
  intentMap.set('bus_scraping', () => others.bus_scraping(admin, agent))

  agent.handleRequest(intentMap)
})