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

var STATUS, db

var service = {},
    status = {},
    host = {}

status.get = (req, res) => {
    if (!req.params || !req.params.host) {
        return res.send(STATUS)
    }
    if (req.params.host && !req.params.service) {
        return res.send(STATUS[req.params.host])
    }
    
    res.send(
        STATUS[req.params.host][req.params.service]
    )
}

host.get = (req, res) => {
    if (!req.params) {
        var retval = {}
        db.createReadStream()
            .on('data', (data) => {
                if (/^host\./.test(data.key))
                    retval[data.value.name] =
                         data.value
            }).on('error', (err) => {
                res.status(500)
                res.send({
                    status: 'error',
                    msg: err
                })
            }).on('close', () => {
                res.send(retval)
            })
        return
    }
    if (req.params.host) {
        db.get(`host.${req.params.host}`, (err, hostval) => {
            if (err) {
                res.status(500)
                res.send({
                    status: 'error',
                    msg: err
                })
                return 
            }

            res.send(hostval)
        })
    }
}
host.put = (req, res) => {
    if (req.body)
}
host.del = (req, res) => {}

service.get = (req, res) => {}
service.put = (req, res) => {}
service.del = (req, res) => {}

module.exports = (_STATUS, _db) => {
    STATUS = _STATUS
    db = _db
    return {
        status: {
            get: status.get
        },
        host: {
            get: host.get,
            put: host.put,
            del: host.del
        },
        service: {
            get: service.get,
            put: service.put,
            del: service.del
        }
    }
}
