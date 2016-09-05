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

var executor = require('./executor.js'),
    parser = require('./parser.js')

// nothing yet
module.exports = () => {

    executor({
        command_name: 'echo',
        path: 'echo',
        args: ['-n', '$0$']
    },
    {
        hostname: 'host1',
        alias: 'host1',
        contact: 'web',
        services: [{
            alias: 'echo',
            service_desc: 'echo',
            check_command: {
                name: 'echo',
                args: ['some string to echo'],
                interval: 1000 * 60 * 10
            }
        }],
        user_defined: {}
    },
    {
        alias: 'echo',
        service_desc: 'echo',
        check_command: {
            name: 'echo',
            args: ['some string to echo'],
            interval: 1000 * 60 * 10
        }
    }, 
    (err, output) => {
        console.log(`exec output: ${output}`)
        console.log(`exec error: ${err}`)
    })

    executor({
        command_name: 'sleep',
        path: 'sleep',
        args: ['$0$']
    },
    {
        hostname: 'host2',
        alias: 'host2',
        contact: 'web',
        services: [{
            alias: 'echo',
            service_desc: 'echo',
            check_command: {
                name: 'echo',
                args: ['some string to echo'],
                interval: 1000 * 60 * 10
            }
        }],
        user_defined: {}
    },
    {
        alias: 'sleep',
        service_desc: 'sleep',
        check_command: {
            name: 'sleep',
            args: ['99'],
            interval: 1000 * 60 * 10
        }
    }, 
    (err, output) => {
        console.log(`exec output: ${output}`)
        console.log(`exec error: ${err}`)
    })

    parser('OK - blah blah blah | \'some val\'=100%; other_val=123MB;0;0;0;0; asd=0;0;0;0;0;',
    (err, service_out, perf) => {
        console.log(`parse error: ${err}`)
        console.log(`parse output: ${service_out}`)
        console.log(perf)
    })
}
