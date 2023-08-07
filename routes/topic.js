var path = require('path');
var sanitizeHtml = require('sanitize-html');
var fs = require('fs');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js')

var express = require('express')
var router = express.Router()
var db = require('../lib/db.js')

router.get('/create', (request, response) => {
    if (!request.user) {
        response.redirect('/')
        return false
    }
    var title = 'WEB - create';
    var list = template.list(request.list)
    var html = template.HTML(title, list, `
      <form action="/topic/create" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '', auth.statusUI(request, response))
    response.send(html)
})

router.post('/create', (request, response) => {
    if (!request.user) {
        response.redirect('/')
        return false
    }
    var post = request.body;
    var title = post.title;
    var description = post.description;
    var id = Math.floor(Math.random() * 1001)
    db.get('topics').push({
        id,
        title,
        description,
        user_id: request.user.id
    }).write()
    response.redirect(`/topic/${id}`)
})

router.get('/update/:pageId', (request, response) => {
    if (!request.user) {
        response.redirect('/')
        return false
    }
    var topic = db.get('topics').find({ id: parseInt(request.params.pageId) }).value()
    if (topic.user_id !== request.user.id) {
        request.flash('error', 'No Authorization')
        return response.redirect('/')
    }
    var title = topic.title
    var description = topic.description
    var list = template.list(request.list)
    var html = template.HTML(title, list,
        `
        <form action="/topic/update" method="post">
          <input type="hidden" name="id" value="${topic.id}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/topic/create">create</a>`,
        auth.statusUI(request, response)
    );
    response.send(html);
})

router.post('/update', (request, response) => {
    if (!request.user) {
        response.redirect('/')
        return false
    }
    var post = request.body
    var id = post.id;
    var title = post.title;
    var description = post.description;
    var topic = db.get('topics').find({ id: parseInt(id) }).value()
    if (topic.user_id !== request.user.id) {
        request.flash('error', 'No Authorization')
        return response.redirect('/')
    }
    db.get('topics').find({id:parseInt(id)}).assign({
        title:title, description: description
    }).write()
    response.redirect(`/topic/${topic.id}`)
})

router.post('/delete', (request, response) => {
    if (!request.user) {
        response.redirect('/')
        return false
    }
    var post = request.body;
    var id = post.id;
    var topic = db.get('topics').find({id: parseInt(id)}).value()
    if (topic.user_id !== request.user.id) {
        request.flash('error', 'No Authorization')
        return response.redirect('/')
    }
    db.get('topics').remove({id: parseInt(id)}).write()
    return response.redirect('/')
})

router.get('/:pageId', (request, response, next) => {
    var topic = db.get('topics').find({ id: parseInt(request.params.pageId) }).value()
    var author = db.get('users').find({ id: topic.user_id }).value()
    var sanitizedTitle = sanitizeHtml(topic.title)
    var sanitizedDescription = sanitizeHtml(topic.description, {
        allowedTags: ['h1']
    })
    var list = template.list(request.list)
    var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}
        <p>by ${author.displayName}</p>`,
        ` <a href="/topic/create">create</a>
        <a href="/topic/update/${topic.id}">update</a>
        <form action="/topic/delete" method="post">
            <input type="hidden" name="id" value="${topic.id}">
            <input type="submit" value="delete">
        </form>`,
        auth.statusUI(request, response)
    )
    response.send(html)
})

module.exports = router