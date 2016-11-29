var config = {}

config.dbPath = './db/'

config.http = {
    port: '9001',
    addr: null, // null = all
    auth: true,
    hostname: 'http://localhost:9001', // name for rss feed links
    // leave blank for '/' root
    root: '' // if you want to use another root dir
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

for (var key in config.env) {
    process.env[key] = config.env[key]
}

module.exports = config
