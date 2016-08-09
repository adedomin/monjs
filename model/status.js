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

var config = require('../config/test'),
    nedb = require('nedb')

/**
 * alias - String
 * hostname - String
 * status - String {ok|warn|crit|UNKN}
 * checked_at - Date
 * perf_data - {
 *   value - int
 *   warn - int
 *   crit - int
 *   min - int
 *   max - int
 * }
 */
module.exports = () => {
    
    var status = new nedb({
        filename: config.db.status,
        autoload: true
    })

    status.ensureIndex({
        fieldName: 'alias',
        unique: true
    })

    status.ensureIndex({
        fieldName: 'hostname',
        unique: true
    })
}
