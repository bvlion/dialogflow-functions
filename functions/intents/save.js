module.exports = (admin, agent) => save(admin, agent)

const axios = require('axios')
const uuid = require('uuid')

async function save(admin, agent) {
  const target = agent.parameters.todoist_target
  const value = agent.parameters.todoist_value

  const id = (await admin.database().ref('/target/' + target).once('value')).val()
  const token = (await admin.database().ref('/token').once('value')).val()

  axios.post('https://api.todoist.com/rest/v1/tasks',
    { content: value, project_id: id },
    {
      headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': uuid.v4(),
      Authorization: 'Bearer ' + token
      }
    })
    .then((res) => console.log(res))
    .catch((error) => console.log(error))
  agent.add(target + 'に' + value + 'を追加しました。他に何か登録されますか？')
}