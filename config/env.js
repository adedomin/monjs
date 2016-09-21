// sets environments
// doesn't export anything

var config = require('./test.js')

for (key in config.env) {
    process.env[key] = config.env[key]
}
