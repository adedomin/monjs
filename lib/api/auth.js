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
    crypto = require('crypto'),
    config = require(process.env.CONFIG_PATH),
    errorRes = require('./helper').errorRes,
    okRes = require('./helper').okRes,
    Auth = require('../model/auth'),
    authRoute = express.Router()

var test_fixed_key = (req, res, next) => {
    if (!req.cookies.key && !req.get('api-key'))
        return errorRes(res, 'No api-key', 403)

    req.authenticated = false
    if (!process.env.API_KEY) {
        req.authenticated = false
    }
    else if (req.get('api-key') === process.env.API_KEY) {
        req.authenticated = true
        req.api_key = req.get('api-key')
    }

    else if (req.cookies.key === process.env.API_KEY) {
        req.authenticated = true
        req.api_key = req.cookies.key
    }

    next()
}

var test_key = (req, res, next) => {
    if (req.authenticated === true)
        return next()

    var query
    if (req.cookies.key)
        query = { key: req.cookies.key }
    else
        query = { key: req.get('api-key') }

    Auth.findOne(query, (err, key) => {
        if (err || !key) 
            return errorRes(res, 'invalid api-key', 403)

        req.authenticated = true
        req.api_key = req.get('api-key')
        next()
    })
}

var genkey = (req, res) => {
    if (req.params 
        && req.params.opt 
        && req.params.opt === 'disable-fixed') {
        
        delete process.env.API_KEY
    }

    crypto.randomBytes(24, (err, buffer) => {
        if (err || buffer.length < 24)
            return errorRes(res, 'cannot generate key!')

        var token = buffer.toString('hex')

        Auth.insert({
            key: token,
            created_on: new Date(),
        }, (err, keys) => {
            if (err || !keys) return errorRes(res, err)
            return okRes(res, `api-key: ${token}`)
        })
    })
}

var is_auth = (req, res) => {
    res.cookie('key', req.api_key, { maxAge: 9000000 })
    okRes(res, 'You are authenticated :)')
}


// simple check for api key as defined in env
if (config.http.auth) {
    authRoute.use(test_fixed_key)
    authRoute.use(test_key)
    authRoute.get('/key/:opt?', genkey)
}
// auth test
authRoute.get('/auth', is_auth)

module.exports = authRoute
