var template = require('../lib/template.js');
var express = require('express')
var router = express.Router()
var db = require('../lib/db.js')
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function (passport) {
  router.get('/login', (request, response) => {
    var fmsg = request.flash()
    var feedback = ''
    if (fmsg.error) {
      feedback = fmsg.error[0]
    }
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="/auth/login" method="post">
          <p><input type="text" name="username" placeholder="email"></p>
          <p><input type="password" name="password" placeholder="password"></p>
          <p>
            <input type="submit" value="login">
          </p>
        </form>
      `, '', '<p>login</p>');
    response.send(html);
  })

  router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash: true,
      successFlash: true
    }))

  router.get('/register', (request, response) => {
    var fmsg = request.flash()
    var feedback = ''
    if (fmsg.error) {
      feedback = fmsg.error[0]
    }
    var title = 'WEB - register';
    var html = template.HTML(title, '', `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/register" method="post">
        <p><input type="text" name="email" placeholder="email" value="@naver.com"></p>
        <p><input type="text" name="displayName" placeholder="name" value="keychron"></p>
        <p><input type="password" name="password" placeholder="password" value="1111111"></p>
        <p><input type="password" name="password2" placeholder="password" value="1111111"></p>
        <p>
          <input type="submit" value="register">
        </p>
      </form>
    `, '', '<p>login</p>');
    response.send(html);
  })

  router.post('/register', (request, response) => {
    var post = request.body
    var email = post.email
    var pwd = post.password
    var pwd2 = post.password2
    var displayName = post.displayName
    if (pwd && pwd2 && pwd === pwd2) {
      bcrypt.hash(pwd, saltRounds, function(err, hash) {
        var user = {
          id: Math.floor(Math.random() * 1001),
          email,
          password: hash,
          displayName
        }
        db.get('users').push(user).write()
        request.login(user, (err) => {
          return response.redirect('/')
        })
      })
    } else {
      request.flash('error', 'password error.')
      response.redirect('/auth/register')
    }
  })

  router.get('/logout', (request, response) => {
    request.logout(function (err) {
      if (err) { return next(err) }
    })
    request.session.destroy((err) => {
      if (err) { return next(err) }
    })
    response.redirect('/')
  })
  return router;
}