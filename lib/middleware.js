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

var STATUS, Host, Service, Auth, logger, allHosts

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

    Auth.findOne({ key: req.get('api-key') }, (err, key) => {
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

        Auth.insert({
            key: token,
            created_on: new Date()
        }, (err, keys) => {
            if (err || !keys) return errorRes(res, err)
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
        allHosts.exec((err, hosts) => {
            if (err) return errorRes(res, err)
            res.send(hosts)
        })
        return
    }

    Host.findOne({ name: req.params.host }, (err, host) => {
        if (err) return errorRes(res, err)
        res.send(host)
    })
}

host.put = (req, res) => {
    if (!req.body) return errorRes(res, 'no json body')

    Host.findOne({ name: req.body.name }, (err, host) => {
        if (err || !host) {
            Host.insert(req.body, (err, host) => {
                if (err || !host) return errorRes(res, err)
                return okRes(res, `insert of ${req.body.name} successful`)
            })
            return
        }
        
        req.body._id = host._id
        Host.save(req.body, (err, host) => {
            if (err || !host) return errorRes(res, err)
            return okRes(res, `updated ${req.body.name} successful`)
        })
    })
}

host.del = (req, res) => {
    if (!req.params || !req.params.host) 
        return errorRes(res, 'no param')

    Host.remove({ name: req.params.host }, {}, (err, count) => {
        if (err || count < 1) return errorRes(res, err || 'unknown err')
        okRes(res, `successfully deleted ${req.params.host}`)
    })
}

service.get = (req, res) => {
    if (!req.params) {
        Service.find({}, (err, services) => {
            if (err) return errorRes(res, err)
            return res.send(services)
        })
    }

    Service.findOne({ _id: req.params.service }, (err, service) => {
        if (err) return errorRes(res, err)
        res.send(service)
    })
}

service.put = (req, res) => {
    if (!req.body || !req.body.host || !req.body.name) 
        return errorRes(res, 'no json body')

    if (req.body._id) {
        Service.save(req.body, (err, service) => {
            if (err || !service) return errorRes(res, err)
            return okRes(res, `updated service ${req.body.name} successful`)
        })
    }

    Service.findOne(
        { name: req.body.name, host: req.body.host }, 
        (err, service) => {

            if (err || !service) {
                Service.insert(req.body, (err, service) => {
                    if (err || !service) return errorRes(res, err)
                    return okRes(res, `insert of service ${req.body.name} successful`)
                })
                return
            }
        
            req.body._id = service._id
            Service.save(req.body, (err, service) => {
                if (err || !service) return errorRes(res, err)
                return okRes(res, `updated service ${req.body.name} successful`)
            })
        }
    )

}

service.del = (req, res) => {
    if (!req.params || !req.params.service)
        return errorRes(res, 'no params?')

    Service.remove({ _id: req.params.service }, {}, (err, count) => {
        if (err || count < 1) return errorRes(res, err || 'unknown err')
        okRes(res, 'successfully deleted')
    })
}

module.exports = (_STATUS, _Host, _Service, _Auth, _logger) => {
    STATUS = _STATUS
    Host =_Host
    Service = _Service
    Auth = _Auth
    logger = _logger
    allHosts = Host.find({})
    return {
        status: status,
        host: host,
        service: service,
        auth: auth
    }
}
