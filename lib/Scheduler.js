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


var EventEmitter = require('events').EventEmitter,
    waterfall = require('async/waterfall'),
    util = require('util')

var Scheduler = function(db) {
    this.db = db
    this.tasks = {}
    
    this.addhost = (key, val) => {
        if (/^service\./.test(key)) {
            if (this.tasks[val.service_name]) { 
                clearInterval(this.tasks[val.service_name])
                delete this.tasks[val.service_name]
            }
            this.tasks[val.service_name] = setInterval(() => {
                waterfall([
                    (next) => this.db.get(`host.${val.service_host}`, next),
                    (host, next) => {
                        this.emit('service.external', host, val)
                        next(null)
                    } 
                ], (err) => {
                    if (err) this.db.del(key)
                })
            }, val.service_interval)
        }
    }

    this.delhost = (key) => {
        var service_name = key.match(/^service\.(.*)/) || []
        clearInterval(this.tasks[service_name[1]])
        delete this.tasks[service_name[1]]
    }

    this.init = () => {
        this.db.createReadStream().on(
            'data', (data) => {
                this.addhost(data.key, data.value)
            }
        )
    }

    this.db.on('put', this.addhost)
    this.db.on('del', this.delhost)

    this.init()
}

util.inherits(Scheduler, EventEmitter)

module.exports = Scheduler
