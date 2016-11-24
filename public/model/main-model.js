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
        bannertype: 'info',
        modalActive: false,
        modalForm: {},
        timeseries: [],
        filterSeries: ''
    },
    effects: effects,
    reducers: reducers,
    subscriptions: subscriptions
}
