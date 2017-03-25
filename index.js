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

var env = require('process').env,
    config = require(env.CONFIG_PATH),
    linvodb = require('linvodb3'),
    Scheduler = require('./lib/Scheduler'),
    Executor = require('./lib/executor'),
    CircularBuffer = require('circular-buffer'),
    perfparse = require('perfdata-parser'),
    router = require('./lib/route'),
    each = require('async/each'),
    _ = Object

linvodb.dbPath = config.dbPath
var Host = new linvodb('Host', require('./schema/host'), {}),
    Service = new linvodb('Service', require('./schema/service'), {}),
    Auth = new linvodb('Auth', require('./schema/auth'), {}),
    TimeSeries = new linvodb('TimeSeries', require('./schema/time-series.js'), {}),
    RSSFeed = new CircularBuffer(66)

// scheduler emits events when services need to run
var scheduler = new Scheduler(),
    executor = new Executor(),
    status = {},
    logger = require('./lib/logger'),
    middleware = require('./lib/middleware')(status, Host, Service, Auth, logger, TimeSeries, RSSFeed)

var status_codes = {
    0: 'OK',
    1: 'WARN',
    2: 'CRIT',
    unkn: 'UNKN'
}

router(middleware)

scheduler.on('service.external', (host, service) => {
    if (!host) {
        // ???
        logger.log('error', `host is null in scheduler for ${service.name}`)
        return scheduler.deltask(service)
    }
    logger.log('debug', `${host.name}:${service.name} event triggered`)
    executor.exec(host, service)
})

executor.on('done', (err, code, output, hostname, servicename) => {
    logger.log('debug', `exec'd ${hostname}:${servicename} => ${output}`)
    var perfdata = perfparse(output)
    code = status_codes[code] || status_codes.unkn

    if (perfdata) {
        _.keys(perfdata).map((key) => {
            TimeSeries.insert({
                date: new Date(),
                service: servicename,
                measure: key,
                value: +perfdata[key].value || 0,
                oum: perfdata[key].oum || ''
            })
        })
    }

    // prevent repeated spam for known failling host
    var currentlyFailing = false
    if (status[hostname] && status[hostname][servicename] &&
        status[hostname][servicename].status != 'OK' && code != 'OK')
        currentlyFailing = true

    if (!status[hostname]) status[hostname] = {}
    status[hostname][servicename] = {
        status: code,
        output: output,
        perfdata: perfdata,
        lastCheck: new Date()
    }
    
    // set fail rss feed if first failure
    if (code != 'OK' && !currentlyFailing) {
        RSSFeed.enq({
            title: `${hostname} - ${servicename}`,
            description: output,
            date: status[hostname][servicename].lastCheck,
            link: `${config.http.hostname}${config.http.root}/#/`
        })
    }
})

executor.on('error', (err, hostname, servicename) => {
    logger.log('info', err)
    if (hostname && servicename) {
        if (!status[hostname]) status[hostname] = {}
        status[hostname][servicename] = {
            status: status_codes.unkn,
            output: err,
            perfdata: undefined,
            lastCheck: new Date()
        }
    }
})

var bulkadd = (services) => {
    each(services, (service, cb) => {
        Host.findOne(
            { name: service.host }, 
            (err, host) => {
                if (err) return cb(err)
                scheduler.addtask(host, service)
                cb()
            }
        )
    }, (err) => {
        if (err) return
    })
}

Service.on('inserted', bulkadd)
Service.on('updated', bulkadd)

Service.on('remove', (service) => {
    scheduler.deltask(service)
    if (status && status[service.host])
        delete status[service.host][service.name]
})

Host.on('remove', (host) => {
    logger.log('info', `services for ${host.name} are not deleted`)
    Service.find({ host: host.name }, (err, services) => {
        if (err) return
        each(services, (service, cb) => {
            scheduler.deltask(service)
            cb()
        })
    })
    delete status[host.name]
})

// init
Service.find({}, (err, services) => {
    if (err) return
    bulkadd(services)
})
