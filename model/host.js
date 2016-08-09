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
 * hostname - String (hostname or IP)
 * alias - String (displayed name, default: host_name)
 * contact - [String (contact index)]
 * services - [{
 *   external - String (optional lookup)
 *   alias - String (short name)
 *   service_desc - String (about)
 *   check_command - {
 *     name - String
 *     args - [String]
 *     interval - int (minutes)
 *   }
 * }]
 * user_defined - {
 *   // USER DEFINED KEY VALUE PAIRS
 *   key - value
 * }
 * template_name - String (if enabled, it's not loaded)
 */
module.exports = () => {

    var host = new nedb({
        filename: config.db.host,
        autoload: true
    })

    host.ensureIndex({
        fieldName: 'hostname',
        unique: true
    })

    host.ensureIndex({
        fieldName: 'template_name'
    })

    return host
}
