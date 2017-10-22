/*
 * Copyright (C) 2017  Anthony DeDominic <adedomin@gmail.com>
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

var express = require('express'),
    errorRes = require('./helper').errorRes,
    okRes = require('./helper').okRes,
    Host = require('../model/host'),
    Service = require('../model/service'),
    STATUS = require('../model/status')

var allHosts = Host.allHosts

var get = (req, res) => {
    if (!req.params || !req.params.host) {
        allHosts.exec((err, hosts) => {
            if (err) return errorRes(res, err)
            res.send(hosts || [])
        })
        return
    }

    Host.findOne({ name: req.params.host }, (err, host) => {
        if (err) return errorRes(res, err)
        res.send(host || {})
    })
}

var put = (req, res) => {
    if (!req.body || !req.body.name || !req.body.address) 
        return errorRes(res, 'Invalid host')

    if (req.body._id) {
        Host.findOne({ _id: req.body._id }, (err, host) => {
            Host.save(req.body, (err, newhost) => {
                if (err || !newhost) return errorRes(res, err)
                okRes(res, `updated ${req.body.name} successful`)

                // host name didn't change
                // return
                if (host.name == newhost.name) return

                // update all services associated with this host
                // with the new host name
                Service.find({ host: host.name }, (err, services) => {
                    Service.save(services.map((service) => {
                        service.host = newhost.name   
                        return service
                    }))
                })

                if (!STATUS[host.name]) return
                STATUS[newhost.name] = STATUS[host.name]
                STATUS[host.name] = null
                return
            })

        })
        return
    }

    Host.findOne({ name: req.body.name }, (err, host) => {
        if (err || !host) {
            Host.insert(req.body, (err, host) => {
                if (err || !host) return errorRes(res, err)
                okRes(res, `insert of ${req.body.name} successful`)
            })
            return
        }
        
        req.body._id = host._id
        Host.save(req.body, (err, host) => {
            if (err || !host) return errorRes(res, err)
            okRes(res, `updated ${req.body.name} successful`)
        })
    })
}

var del = (req, res) => {
    if (!req.params || !req.params.host) 
        return errorRes(res, 'No params')

    Host.remove({ name: req.params.host }, {}, (err, count) => {
        if (err || count < 1) return errorRes(res, err || `No such host, ${req.params.host}`)
        okRes(res, `successfully deleted ${req.params.host}`)
    })
}

var hostRoute = express.Router()

hostRoute.get('/', get)
hostRoute.put('/', put)
hostRoute.get('/:host', get)
hostRoute.delete('/:host', del)

module.exports = hostRoute
