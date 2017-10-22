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
    perfparse = require('perfdata-parser'),
    each = require('async').each

linvodb.dbPath = config.dbPath

// scheduler emits events when services need to run
var scheduler = new Scheduler(),
    executor = new Executor(),
    status = require('./lib/model/status'),
    logger = require('./lib/logger')

var Host = require('./lib/model/host'),
    RSSFeed = require('./lib/model/rss'),
    Service = require('./lib/model/service'),
    TimeSeries = require('./lib/model/time-series')

var status_codes = {
    0: 'OK',
    1: 'WARN',
    2: 'CRIT',
    unkn: 'UNKN',
}

require('./lib/route')

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
    var check_date = new Date()
    logger.log('debug', `exec'd ${hostname}:${servicename} => ${output}`)
    var perfdata = perfparse(output)
    code = status_codes[code] || status_codes.unkn

    if (perfdata) {
        Object.keys(perfdata).forEach((key) => {
            TimeSeries.insert({
                date: check_date,
                service: servicename,
                measure: key,
                value: +perfdata[key].value || 0,
                oum: perfdata[key].oum || '',
            })
        })
    }

    // prevent repeated spam for known failling host
    var currentlyFailing = false
    // note that boolean expressions don't always return true or false
    if (status[hostname] && status[hostname][servicename] &&
        status[hostname][servicename].status != 'OK' && code != 'OK')
        currentlyFailing = true

    // set fail rss feed if first failure
    if (code != 'OK' && !currentlyFailing) {
        RSSFeed.enq({
            title: `FAILING -> ${hostname} - ${servicename}`,
            description: output,
            date: check_date,
            link: `${config.http.hostname}${config.http.root}/#/`,
        })
    }
    // if a service has recovered
    else if (code == 'OK' && ( status[hostname] &&
                               status[hostname][servicename] && 
                               status[hostname][servicename].status != 'OK' )
    ) {
        RSSFeed.enq({
            title: `RECOVERED -> ${hostname} - ${servicename}`,
            description: output,
            date: check_date,
            link: `${config.http.hostname}${config.http.root}/#/`,
        })
    }

    if (!status[hostname]) status[hostname] = {}
    status[hostname][servicename] = {
        status: code,
        output,
        perfdata,
        lastCheck: new Date(),
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
            lastCheck: new Date(),
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
