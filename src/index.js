const app = require('./http/app')

module.exports = app

if (!module.parent) app.initialize()
