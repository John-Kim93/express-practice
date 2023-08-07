// Import
var fs = require('fs');
const bodyParser = require('body-parser');
var compression = require('compression')
// var helmet = require('helmet')
// app.use(helmet())
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash')

var express = require('express')
var app = express()
var db = require('./lib/db')

// middleware
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression())
app.get('*', function (request, response, next) {
  request.list = db.get('topics').value()
  next()
})
app.use(session({
  secret: 'keyboard',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))
app.use(flash())
var passport = require('./lib/passport')(app)

// router
var rootRouter = require('./routes/index')
var topicRouter = require('./routes/topic')
var authRouter = require('./routes/auth')(passport)
app.use('/', rootRouter)
app.use('/topic', topicRouter)
app.use('/auth', authRouter)

// error
app.use((req, res, next) => {
  res.status(404).send('404 404 404 404 | page not found (customed)')
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('500 500 500 500 | no service exist (customed)')
})

// listen
app.listen(3000, () => console.log("Example app listening on port 3000!"))
