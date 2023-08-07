var db = require('../lib/db.js')
var bcrypt = require('bcrypt')

module.exports = function (app) {
    var passport = require('passport')
    var LocalStrategy = require('passport-local').Strategy

    app.use(passport.initialize())
    app.use(passport.session())

    passport.serializeUser(function (user, done) {
        console.log('serializeUser', user)
        done(null, user.id)
    })
    passport.deserializeUser(function (id, done) {
        console.log('deserializeUser', id)
        var user = db.get('users').find({ id: id }).value()
        done(null, user)
    })

    passport.use(new LocalStrategy(
        function (email, password, done) {
            var user = db.get('users').find({ email: email }).value()
            if (user) {
                bcrypt.compare(password, user.password, function(err, result){
                    if (result) {
                        return done(null, user, {
                            message: "Login Success"
                        })
                    } else {
                        return done(null, false, {
                            message: "Login Fail : Wrong Password"
                        })
                    }
                })
            } else {
                return done(null, false, {
                    message: "Login Fail : Wrong Email"
                })
            }
        }
    ))
    return passport
}
