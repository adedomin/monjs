var config = {}

config.db = './db/host-service.db'

config.http = {
    port: '9001',
    addr: null // null = all
}

config.logger = {
    level: 'debug'
}

module.exports = config
