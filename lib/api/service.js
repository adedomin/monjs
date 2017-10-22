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
    Service = require('../model/service'),
    STATUS = require('../model/status')

var get = (req, res) => {
    if (!req.params || !req.params.service) {
        Service.find({}, (err, services) => {
            if (err) return errorRes(res, err)
            res.send(services || [])
        })
        return
    }

    Service.findOne({ _id: req.params.service }, (err, service) => {
        if (err) return errorRes(res, err)
        res.send(service || {})
    })
}

var put = (req, res) => {
    if (!req.body || !req.body.host || !req.body.name) 
        return errorRes(res, 'Invalid Service')

    if (req.body._id) {
        Service.findOne({ _id: req.body._id }, (err, service) => {
            Service.save(req.body, (err, service) => {
                if (err || !service) return errorRes(res, err)
                okRes(res, `updated service ${req.body.name} successful`)
            })

            if (!STATUS[req.body.host] || !STATUS[req.body.host][service.name])
                return

            delete STATUS[req.body.host][service.name]
        })
        return
    }

    Service.findOne(
        { name: req.body.name, host: req.body.host }, 
        (err, service) => {
            if (err || !service) {
                Service.insert(req.body, (err, service) => {
                    if (err || !service) return errorRes(res, err)
                    okRes(res, `insert of service ${req.body.name} successful`)
                })
                return
            }
        
            req.body._id = service._id
            Service.save(req.body, (err, service) => {
                if (err || !service) return errorRes(res, err)
                okRes(res, `updated service ${req.body.name} successful`)
            })
        }
    )

}

var del = (req, res) => {
    if (!req.params || !req.params.service)
        return errorRes(res, 'no params?')

    Service.remove({ _id: req.params.service }, {}, (err, count) => {
        if (err || count < 1) return errorRes(res, err || 'unknown err')
        okRes(res, 'successfully deleted')
    })
}

var recheck = (req, res) => {
    if (!req.params.service)
        return errorRes(res, 'no params?')

    okRes(res, `rechecking ${req.params.service}`)
    Service.findOne({ name: req.params.service }, (err, service) => {
        if (err || !service) return
        Service.save(service)
    })
}

var serviceRoute = express.Router()

serviceRoute.get('/', get)
serviceRoute.put('/', put)
serviceRoute.get('/:service', get)
serviceRoute.delete('/:service', del)
serviceRoute.get('/recheck/:service', recheck)

module.exports = serviceRoute
