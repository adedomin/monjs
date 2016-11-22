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
        http('/api/v1/status', (err, res, body) => {
            if (err || res.statusCode != 200) 
                return send('errorBanner', 'Could not get status.', done)
            body = JSON.parse(body)
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
        http('/api/v1/host', (err, res, body) => {
            if (err || res.statusCode != 200) 
                return send('errorBanner', 'Could not get hosts.', done)
            body = JSON.parse(body)
            send('hostChange', body, done)
        })
    },
    getServices: (data, state, send, done) => {
        http('/api/v1/service', (err, res, body) => {
            if (err || res.statusCode != 200)
                return send('errorBanner', 'Could not get services.', done)
            body = JSON.parse(body)
            send('serviceChange', body, done)
        })
    },
    addService: (data, state, send, done) => {
        http({
            method: 'put',
            body: JSON.stringify(data),
            uri: '/api/v1/service',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (err, res, body) => {
            if (err || !body || body.status == 'error') {
                if (body && body.msg) err = body.msg
                return send('errorBanner', err)
            }
            send('okBanner', body.msg, done)
        })
    },
    addHost: (data, state, send, done) => {
        http({
            method: 'put',
            body: JSON.stringify(data),
            uri: '/api/v1/host'
        }, (err, res, body) => {
            if (err || !body || body.status == 'error') {
                if (body && body.msg) err = body.msg
                return send('errorBanner', err)
            }
            send('okBanner', body.msg, done)
        })
    }
}
