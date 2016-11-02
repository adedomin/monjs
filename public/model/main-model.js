var effects = require('../lib/effects'),
    reducers = require('../lib/reducers'),
    subscriptions = require('../lib/subscriptions')

module.exports = {
    state: {
        status: {},
        hosts: [],
        services: [],
        filterBy: '',
        banner: '',
        bannertype: 'info'
    },
    effects: effects,
    reducers: reducers,
    subscriptions: subscriptions
}
