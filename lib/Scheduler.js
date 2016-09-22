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
    each = require('async/each'),
    util = require('util')

var Scheduler = function(Host, Service, STATUS) {
    this.Host = Host
    this.Service = Service
    this.STATUS = STATUS
    this.tasks = {}

    this.addtask = (host, service) => {
        if (this.tasks[service._id])
            this.deltask(service)
        this.tasks[service._id] = setInterval(() => {
            this.emit('service.external', host, service)
        }, service.interval)
    }

    this.deltask = (service) => {
        clearInterval(this.tasks[service._id])
        delete this.tasks[service._id]
        if (this.STATUS && this.STATUS[service.host])
            delete STATUS[service.host][service.name]
    }

    this.bulkadd = (services) => {
        each(services, (service, cb) => {
            Host.findOne(
                { name: service.host }, 
                (err, host) => {
                    if (err) return cb(err)
                    this.addtask(host, service)
                    cb()
                }
            )
        }, (err) => {
            if (err) return
        })
    } 

    Service.on('inserted', (services) => {
        this.bulkadd(services)
    })

    Service.on('updated', (services) => {
        each(services, (service, cb) => {
            this.deltask(service)
            cb()
        }, (err) => {
            if (err) return
            this.bulkadd(services)
        })
    })

    Service.on('remove', this.deltask)

    Host.on('remove', (host) => {
        Service.find({ host: host.name }, (err, services) => {
            if (err) return
            each(services, (service, cb) => {
                this.deltask(service)
                cb()
            })
        })
        
        delete STATUS[host.name]
    })

    // init
    Service.find({}, (err, services) => {
        if (err) return
        this.bulkadd(services)
    })
}

util.inherits(Scheduler, EventEmitter)

module.exports = Scheduler
