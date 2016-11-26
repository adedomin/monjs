var winston = require('winston'),
    find = require('find-config'),
    config = require(find('.mon.js'))

module.exports = new winston.Logger({
    emitErrs: true,
    transports: [
        new winston.transports.Console({
            level: config.logger.level,
            prettyPrint: false,
            silent: false,
            timestamp: true,
            colorize: true,
            json: false
        })
    ]
})


