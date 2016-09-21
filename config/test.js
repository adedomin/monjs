var config = {}

config.db = './db/host-service.db'

config.http = {
    port: '9001',
    addr: null // null = all
}

config.logger = {
    level: 'debug'
}

// set these environments at start
// primarily for adjusting $PATH
// so spawn can find your nagios
// plugins
//
// Currently no account creation, use a secret key for now
config.env = {
    PATH: `${process.env.PATH}:/usr/lib/monitoring-plugins/`,
    API_KEY: 'a secret =]'
}

module.exports = config
