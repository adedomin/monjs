var winston = require('winston'),
    config = require('../config/test')

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


