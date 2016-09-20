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

var STATUS, db, logger

var service = {},
    status = {},
    host = {}

var errorRes = (res, err) => {
    logger.log('debug', err)
    res.status(500)
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
        okRes(res, `deleted host: ${req.params.host}`)
    }) 
}

module.exports = (_STATUS, _db, _logger) => {
    STATUS = _STATUS
    db = _db
    logger = _logger
    return {
        status: status,
        host: host,
        service: service
    }
}
