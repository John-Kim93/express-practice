module.exports = {
    statusUI: function(request, response) {
        var authStatusUI = '<a href="/auth/login">login</a> | <a href="/auth/register">Register</a>'
        if (request.user) {
            authStatusUI = `${request.user.displayName} | <a href="/auth/logout">logout</a>`
        }
        return authStatusUI
    }
}