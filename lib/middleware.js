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

var crypto = require('crypto')

var STATUS, db, logger

var service = {},
    status = {},
    host = {},
    auth = {}

var errorRes = (res, err, code) => {
    logger.log('debug', err)
    res.status(code || 500)
    res.send({
        status: 'error',
        msg: err.toString()
    })
}

var okRes = (res, msg) => {
    logger.log('info', msg)
    res.send({
        status: 'ok',
        msg: msg
    })
}

auth.test_fixed_key = (req, res, next) => {
    if (!req.get('api-key')) 
        return errorRes(res, 'No api-key', 403)

    if (!process.env.API_KEY) {
        req.authenticated = false
        return next()
    }

    req.authenticated = true
    if (!(req.get('api-key') === process.env.API_KEY)) {
        req.authenticated = false
    }

    next()
}

auth.test_key = (req, res, next) => {
    if (req.authenticated === true)
        return next()

    db.get(`authkey.${req.get('api-key')}`, (err, key) => {
        if (err || !key) 
            return errorRes(res, 'invalid api-key', 403)

        req.authenticated = true
        next()
    })
}

auth.genkey = (req, res) => {
    if (req.params 
        && req.params.opt 
        && req.params.opt === 'disable-fixed') {
        
        delete process.env.API_KEY
    }

    crypto.randomBytes(24, (err, buffer) => {
        if (err || buffer.length < 24)
            return errorRes(res, 'cannot generate key!')

        var token = buffer.toString('hex')

        db.put(`authkey.${token}`, {
            on: new Date()
        }, (err) => {
            if (err) errorRes(res, 'cannot save key')
            okRes(res, `api-key: ${token}`)
        })
    })
}

auth.is_auth = (req, res) => {
    okRes(res, 'You are authenticated :)')
}

status.get = (req, res) => {
    if (!req.params || !req.params.host) {
        return res.send(STATUS)
    }
    if (req.params.host && !req.params.service) {
        return res.send(STATUS[req.params.host]) || {}
    }
    
    res.send(
        STATUS[req.params.host][req.params.service] || {}
    )
}

host.get = (req, res) => {
    if (!req.params || !req.params.host) {
        var retval = {}
        db.createReadStream()
            .on('data', (data) => {
                if (/^host\./.test(data.key))
                    retval[data.value.name] =
                         data.value
            }).on('error', (err) => {
                errorRes(res, err)
            }).on('close', () => {
                res.send(retval)
            })
        return
    }

    db.get(`host.${req.params.host}`, (err, hostval) => {
        if (err) return errorRes(res, err)
        res.send(hostval)
    })
}
host.put = (req, res) => {
    if (!req.body || !req.body.name || !req.body.address) 
        return errorRes(
            res, 
            'invalid host, most contain a "name" & "address"'
        )

    db.put(
        `host.${req.body.name}`, 
        req.body, 
        (err) => {
            if (err) return errorRes(res, err)
            okRes(res, `inserted host: ${req.body.name}`)
        }
    )
}
host.del = (req, res) => {
    db.del(`host.${req.params.host}`, (err) => {
        if (err) return errorRes(res, err)
        okRes(res, `deleted host: ${req.params.host}`)
    }) 
}

service.get = (req, res) => {
    if (!req.params || !req.params.service) {
        var retval = {}
        db.createReadStream()
            .on('data', (data) => {
                if (/^service\./.test(data.key))
                    retval[data.value.name] =
                         data.value
            }).on('error', (err) => {
                errorRes(res, err)
            }).on('close', () => {
                res.send(retval)
            })
        return
    }

    db.get(`service.${req.params.service}`, (err, serviceval) => {
        if (err) return errorRes(res, err)
        res.send(serviceval)
    })
}
service.put = (req, res) => {
    if (!req.body || !req.body.name || !req.body.host ||
        !req.body.command || !req.body.args || !req.body.interval) 
        return errorRes(res, 'invalid service')

    db.put(
        `service.${req.body.name}`, 
        req.body,
        (err) => {
            if (err) return errorRes(res, err)
            okRes(res, `inserted service: ${req.body.name}`)
        }
    )
}
service.del = (req, res) => {
    db.del(`service.${req.params.service}`, (err) => {
        if (err) return errorRes(res, err)
        okRes(res, `deleted service: ${req.params.service}`)
    }) 
}

module.exports = (_STATUS, _db, _logger) => {
    STATUS = _STATUS
    db = _db
    logger = _logger
    return {
        status: status,
        host: host,
        service: service,
        auth: auth
    }
}
