var effects = require('../lib/effects'),
    reducers = require('../lib/reducers'),
    subscriptions = require('../lib/subscriptions')

module.exports = {
    state: {
        status: [],
        hosts: [],
        services: [],
        filter: '',
        filterTarget: 'host',
        failFilter: false,
        banner: '',
        bannertype: 'info'
    },
    effects: effects,
    reducers: reducers,
    subscriptions: subscriptions
}
