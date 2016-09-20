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

var spawn = require('child_process').spawn

var replaceArgs = (host, args) => {
    var arglist = []
    args.forEach((arg) => {
        var match = arg.match(/\$(.*)\$/)
        if (match) {
            arglist.push(host[match[1]])
            return
        }
        arglist.push(arg)
        
    })
    return arglist
}

var spawnCmd = (command, args, next) => {
    var out = '',
        err = ''

    var cmd = spawn(command, args)
    
    var timeout = setTimeout(() => {
        err = '!!! TIMEOUT !!!'
        cmd.kill()
    }, 1000 * 30)

    cmd.stdout.on('data', (data) => {
        out += data
    })

    cmd.stderr.on('data', (data) => {
        err += data
    })

    cmd.on('close', (code) => {
        clearTimeout(timeout)
        return next(err, code, out)
    })
}

module.exports = (host, service, next) => {
    if (!host || !service) {
        if (!next) return
        return next('invalid arguments')
    }
    
    spawnCmd(
        service.service_command, 
        replaceArgs(host, service.service_args),
        next
    )
}
