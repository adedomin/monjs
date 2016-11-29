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

var crypto = require('crypto'),
    Feed = require('feed'),
    find = require('find-config'),
    config = require(find('.mon.js'))


var STATUS, Host, Service, Auth, TimeSeries, RSSFeed, logger, allHosts

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

var timeseries = (req, res) => {
    if (!req.params || !req.params.service || !req.params.since)
        return errorRes(res, 'invalid request')

    req.params.since = new Date(req.params.since)

    if (isNaN(req.params.since.getTime()))
        return errorRes(res, 'invalid date')

    TimeSeries.find({
        service: req.params.service,
        date: { $gte: req.params.since }
    }, (err, ts) => {
        if (err || !ts) return errorRes(res, err)
        res.send(ts)
    })
}

var rssfeed = (req, res) => {
    Auth.findOne({ key: req.params.secret }, (err, key) => {
        if (err || !key) return errorRes(res, 'not authorized to view this feed', 403)

        var feed = new Feed({
            title: 'MonJS',
            description: 'Warning and Error Feed',
            link: `${config.http.hostname}${config.http.root}/#/`,
            id: 'monjs-feed'
        })

        RSSFeed.toarray().forEach(feeditem => feed.addItem(feeditem))

        res.type('application/atom+xml')
        res.send(feed.render('atom-1.0'))
    })
}

auth.test_fixed_key = (req, res, next) => {
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

auth.test_key = (req, res, next) => {
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
            return okRes(res, `api-key: ${token}`)
        })
    })
}

auth.is_auth = (req, res) => {
    res.cookie('key', req.api_key, { maxAge: 9000000 })
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
            res.send(hosts || [])
        })
        return
    }

    Host.findOne({ name: req.params.host }, (err, host) => {
        if (err) return errorRes(res, err)
        res.send(host || {})
    })
}

host.put = (req, res) => {
    if (!req.body || !req.body.name || !req.body.address) 
        return errorRes(res, 'Invalid host')

    if (req.body._id) {
        Host.save(req.body, (err, host) => {
            if (err || !host) return errorRes(res, err)
            okRes(res, `updated ${req.body.name} successful`)
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

host.del = (req, res) => {
    if (!req.params || !req.params.host) 
        return errorRes(res, 'No params')

    Host.remove({ name: req.params.host }, {}, (err, count) => {
        if (err || count < 1) return errorRes(res, err || `No such host, ${req.params.host}`)
        okRes(res, `successfully deleted ${req.params.host}`)
    })
}

service.get = (req, res) => {
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

service.put = (req, res) => {
    if (!req.body || !req.body.host || !req.body.name) 
        return errorRes(res, 'Invalid Service')

    if (req.body._id) {
        Service.save(req.body, (err, service) => {
            if (err || !service) return errorRes(res, err)
            okRes(res, `updated service ${req.body.name} successful`)
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

service.del = (req, res) => {
    if (!req.params || !req.params.service)
        return errorRes(res, 'no params?')

    Service.remove({ _id: req.params.service }, {}, (err, count) => {
        if (err || count < 1) return errorRes(res, err || 'unknown err')
        okRes(res, 'successfully deleted')
    })
}

module.exports = (_STATUS, _Host, _Service, _Auth, _logger, _TimeSeries, _RSSFeed) => {
    STATUS = _STATUS
    Host =_Host
    Service = _Service
    Auth = _Auth
    TimeSeries = _TimeSeries
    RSSFeed = _RSSFeed
    logger = _logger
    allHosts = Host.find({})
    return {
        status: status,
        host: host,
        service: service,
        auth: auth,
        timeseries: timeseries,
        rss: rssfeed
    }
}
