/*
 * eZios: Monitoring daemon like nagios, but dynamically configurable.
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

var express = require('express'),
    config = require('../config/test.js')

module.exports = (middleware) => {
    
    var app = express(),
        apiRoute = express.Router()

    // simple check for api key as defined in env
    if (config.auth) {
        apiRoute.use(middleware.auth.test_fixed_key)
        apiRoute.use(middleware.auth.test_key)
        apiRoute.get('/key/:opt?', middleware.auth.genkey)
    }
    // auth test
    apiRoute.get('/auth', middleware.auth.is_auth)

    apiRoute.get('/status', middleware.status.get)
    apiRoute.get('/status/:host', middleware.status.get)
    apiRoute.get('/status/:host/:service', middleware.status.get)

    apiRoute.get('/host', middleware.host.get)
    apiRoute.put('/host', middleware.host.put)
    apiRoute.get('/host/:host', middleware.host.get)
    apiRoute.delete('/host/:host', middleware.host.del)

    apiRoute.get('/host/:host/service', middleware.service.get)
    apiRoute.put('/host/:host/service', middleware.service.put)
    apiRoute.get('/host/:host/service/:service', middleware.service.get)
    apiRoute.delete('/host/:host/service/:service', middleware.service.del)

    app.use(require('body-parser').json())
//    app.use(require('cookie-parser')())
    app.use('/', express.static(__dirname + '/../public'))
    app.use('/api/v1', apiRoute)
    app.get('/', (req, res) => {
        res.sendFile(__dirname+'/../public/index.html')
    })

    app.listen(config.http.port, config.http.addr)
}
