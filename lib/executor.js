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

var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn

var Executor = function() {

    this.replaceArgs = (host, args) => {
        if (!args) args = []
        var arglist = []
        args.forEach((arg) => {
            var match = arg.match(/\$(.*)\$/)
            if (match && /^_/.test(match[1]) && host.extra_vars) {
                arglist.push(host.extra_vars[match[1].toLowerCase()])
            }
            else if (match) {
                arglist.push(host[match[1].toLowerCase()])
            }
            else {
                arglist.push(arg)
            }
        })
        return arglist
    }

    this.spawnCmd = (host, service, args) => {
        var out = '',
            err = ''

        var cmd = spawn(service.command, args)
        
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
            this.emit('done', err, code, out, host.name, service.name)
        })

        cmd.on('error', (error) => {
            clearTimeout(timeout)
            this.emit('error', error, host.name, service.name)
        })
    }

    this.exec = (host, service) => {
        if (!host || !service) {
            return this.emit('error', 'lacking host or service')
        }

        this.spawnCmd(
            host,
            service, 
            this.replaceArgs(host, service.args)
        )
    }
}

util.inherits(Executor, EventEmitter)
module.exports = Executor
