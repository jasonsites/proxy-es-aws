const app = require('./http/app')

if (!module.parent) app.initialize()
else module.exports = app
