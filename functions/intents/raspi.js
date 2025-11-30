module.exports.speakText = (text, admin, execSend) => speakText(text, admin, execSend)
module.exports.curtain = (command, admin, execSend) => curtain(command, admin, execSend)
module.exports.floorheating = (admin, execSend) => floorheating(admin, execSend)
module.exports.sesame = (command, admin, execSend) => sesame(command, admin, execSend)

async function speakText(text, admin, execSend) {
  await admin.database().ref('/pi/notifier').set(text)
  execSend('speak ' + text)
}

async function curtain(command, admin, execSend) {
  await admin.database().ref('/pi/curtain').set(command)
  execSend('curtain ' + command)
}

async function floorheating(admin, execSend) {
  await admin.database().ref('/pi/floorheating').set(new Date().toISOString())
  execSend('floor heating updated')
}

async function sesame(command, admin, execSend) {
  await admin.database().ref('/pi/sesame').set(command)
  execSend('sesame ' + command)
}
