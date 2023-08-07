var template = require('../lib/template.js')
var auth = require('../lib/auth.js')

var express = require('express')
var router = express.Router()

router.get('/', (request, response) => {
  var fmsg = request.flash()
  var feedback = ''
  if (fmsg.success) {
    feedback = fmsg.success[0]
  }
  if (fmsg.error) {
    feedback = fmsg.error[0]
  }
  var title = "Welcome"
  var description = 'Hello, Node.js'
  var list = template.list(request.list)
  var html = template.HTML(title, list,
    `<div style="color: red;">${feedback}</div>
      <h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:250px; display:block; margin-top:20px;"/>`,
    `<a href="/topic/create">create</a>`,
    auth.statusUI(request, response)
  )
  response.send(html)
})

module.exports = router