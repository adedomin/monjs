/*
   eZios: Monitoring daemon like nagios, but dynamically configurable.
   Copyright (C) 2016 Anthony DeDominic <anthony@dedominic.pw>
   
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var config = require('./config/test'),
    db = require('level')(
        config.db_path,
        { valueEncoding: 'json' }
    ),
    waterfall = require('async/waterfall'),
    Scheduler = require('./lib/Scheduler'),
    executor = require('./lib/executor'),
    perfparser = require('./lib/perf-parser'),
    logger = require('winston')

var scheduler = new Scheduler(db),
    STATUS = {} // note this is in memory!

scheduler.on('service.external', (host, service) => {
    var status_code = -1
    waterfall([
        (next) => executor(host, service, next),
        (code, output, next) => {
            status_code = code
            perfparser(output, next)
        },
        (output, perfdata, next) => {
            if (!STATUS[host.name]) 
                STATUS[host.name] = {}
            if (!STATUS[host.name][service.name])
                STATUS[host.name][service.name] = {}

            STATUS[host.name][service.name] = {
                status: status_code,
                output: output,
                perfdata: perfdata || 'n/a'
            }

            logger.log(
                'info',
                `${host.name}-${service.name}: ${output}`
            )

            next(null)
        }
    ], (err) => {
        if (err) logger.log('error', err)
    })
})
