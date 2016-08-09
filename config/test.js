var config = {}

config.db = {
    host: '../db/host.db',
    contact: '../db/contact.db',
    command: '../db/command.db',
    status: '../db/status.db'
}

config.http = {
    root: '/',
    apiRoot: '/api/v1/',
    staticDir: '../resources'
}

module.exports = config
