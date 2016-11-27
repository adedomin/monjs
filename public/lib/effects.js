/*
 * Copyright (C) 2016 Anthony DeDominic <anthony@dedominic.pw>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var http = require('choo/http'),
    _ = require('lodash')

module.exports = {
    updateStatus: (data, state, send, done) => {
        http({
            uri: 'api/v1/status',
            withCredentials: true
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || res.statusCode != 200 || !body || body.status == 'error') 
                return send('errorBanner', 'Could not get status.', done)
            var status = []
            // transform status to an array for easier processing
            _.keys(body).map(host => {
                _.keys(body[host]).map(service => {
                    body[host][service].service = service
                    body[host][service].hostname = host
                    status.push(body[host][service])
                })
            })
            send('statusChange', status, done)
        })
    },
    getHosts: (data, state, send, done) => {
        http({ 
            uri: 'api/v1/host',
            withCredentials: true
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || res.statusCode != 200 || !body || body.status == 'error')
                return send('errorBanner', 'Could not get hosts.', done)
            
            send('hostChange', body, done)
        })
    },
    getServices: (data, state, send, done) => {
        http({
            uri: 'api/v1/service', 
            withCredentials: true
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || res.statusCode != 200 || !body || body.status == 'error') 
                return send('errorBanner', 'Could not get services.', done)

            send('serviceChange', body, done)
        })
    },
    getTimeSeries: (data, state, send, done) => {
        http({
            method: 'get',
            uri: `api/v1/metrics/${data.service}/${new Date(new Date().getTime() - data.since).toISOString()}`,
            withCredentials: true
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || res.statusCode != 200 || !body || body.status == 'error')
                return send('errorBanner', 'Could not get timeseries', done)
            
            send('timeseriesChange', body, done)
        })
    },
    addObject: (data, state, send, done) => {
        http({
            method: 'put',
            body: JSON.stringify(state.modalForm),
            uri: `api/v1/${data}`,
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || res.statusCode != 200 || !body || body.status == 'error') {
                if (body && body.msg) err = body.msg
                else err = `Could not add ${data}`
                send('cancelModal', null, () => {
                    send('errorBanner', err, done)
                })
                return
            }
            send('cancelModal', null, () => {
                send('getHosts', null, () => {
                    send('getServices', null, () => {
                        send('okBanner', body.msg, done)
                    })
                })
            })
        })
    },
    delObject: (data, state, send, done) => {
        http({
            method: 'delete',
            uri: `api/v1/${data}`,
            withCredentials: true
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || res.statusCode != 200 || !body || body.status == 'error') {
                if (body && body.msg) err = body.msg
                else err = `Could not delete ${data}`
                send('cancelModal', null, () => { 
                    send('errorBanner', err, done)
                })
            }
            send('cancelModal', null, () => {
                send('getHosts', null, () => {
                    send('getServices', null, () => {
                        send('okBanner', body.msg, done)
                    })
                })
            })
        })
    },
    testAuth: (data, state, send, done) => {
        http({
            uri: 'api/v1/auth',
            headers: {
                'api-key': data
            },
            withCredentials: true
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || res.statusCode != 200 || !body || body.status == 'error') 
                return send('authChange', false, done)

            send('authChange', true, () => {
                send('clearBanner', body.msg, () => {
                    send('getHosts', null, () => {
                        send('getServices', null, () => {
                            send('updateStatus', null, done)
                        })
                    })
                })
            })
        })
    }
}
