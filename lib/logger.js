var winston = require('winston'),
    env = require('process').env,
    config = require(env.CONFIG_PATH)

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


