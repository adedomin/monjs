/*
 * Copyright (C) 2016  prussian <genunrest@gmail.com>
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

var waterfall = require('async/waterfall'),
    executor = require('./executor'),
    perfparser = require('./perf-parser')

var status_codes = {
    0: 'OK',
    1: 'WARN',
    2: 'CRIT',
    unkn: 'UNKN'
}

module.exports = (STATUS, TimeSeries, logger, scheduler) => {
    scheduler.on('service.external', (host, service) => {
        var status_code = -1
        waterfall([
            (next) => executor(host, service, next),
            (code, output, next) => {
                status_code = 
                    status_codes[code] 
                    || status_codes.unkn
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
                    perfdata: perfdata,
                    time: new Date()
                }

                if (perfdata !== 'N/A') {
                    TimeSeries.insert({ 
                        timestamp: new Date(),
                        service: service.name,
                        value: perfdata.value,
                        oum: perfdata.oum
                    })
                }

                logger.log(
                    'debug',
                    `${service.name}@${host.name}: ${output}`
                )

                next(null)
            }
        ], (err) => {
            if (err) logger.log('warn', err)
        })
    })
}
