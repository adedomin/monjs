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

require('./config/env') // set env

var config = require('./config/test'),
    STATUS = {}, // note this is in memory!
    linvodb = require('linvodb3'),
    Scheduler = require('./lib/Scheduler')

linvodb.dbPath = config.dbPath
var Host = new linvodb('Host', require('./schema/host'), {}),
    Service = new linvodb('Service', require('./schema/service'), {}),
    Auth = new linvodb('Auth', require('./schema/auth'), {}),
    TimeSeries = new linvodb('TimeSeries', require('./schema/time-series.js'), {})

// scheduler emits events when services need to run
var scheduler = new Scheduler(Host, Service),
    logger = require('./lib/logger')

// register external Executor
require('./lib/external')(STATUS, TimeSeries, logger, scheduler)
// start web
require('./lib/route')(STATUS, Host, Service, Auth, logger)
