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

var async = require('async')

module.exports = (input, next) => {
 
    // long out not supported
    input = input.split('\n')[0].split('|')
    var service_out = input[0].trim()

    // no perfdata
    if (!input[1]) return next(null, service_out)

    // 'label'=value[UOM];[warn];[crit];[min];[max]
    var perf = {}
    // splits by label & values
    var perfdatas = input[1].trim().split(/\s+(?=(?:[^\']*[\'][^\']*[\'])*[^\']*$)/)
    async.each(perfdatas, (perfdata, cb) => {
        
        perfdata = perfdata.split('=')
        var label = perfdata[0]
        if (!perfdata[1]) return cb('invalid perfdata, no values')
        var values = perfdata[1].split(';')

        if (!values[0]) return cb('invalid perfdata, no primary value')
        value_oum = values[0].match(/(\d+)(.*)/)

        perf[label] = {
            oum: value_oum[2],
            value: value_oum[1],
            warn: values[1] || '',
            crit: values[2] || '',
            min: values[3] || '',
            max: values[4] || ''
        }
        cb(null)
    }, (err) => {
        
        if (err) return next(err, service_out)
        next(err, service_out, perf)
    })
}
