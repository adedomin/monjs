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
var spawn = require('child_process').spawn,
    async = require('async')

// nothing yet
module.exports = (command, host, service, next) => {
    if (!command || !host || !service) {
        if (!next) return
        return next('invalid arguments')
    }

    var args = []
    var out = ''
    var err = ''
    async.each(command.args, (arg, cb) => {

        var match = arg.match(/\$(\d*)\$/)
        if (match && service.check_command
            && service.check_command.args) {

            args.push(service.check_command
                .args[+match[1]] || ''
            )
            return cb(null)
        }

        match = arg.match(/\$(HOSTNAME|ALIAS)\$/)
        if (match) {
            
            args.push(host[
                match[1].toLowerCase()] || ''
            )
            return cb(null)
        }

        match = arg.match(/\$_(.*)\$/)
        if (match && host.user_defined) {

            args.push(host.user_defined[
                match[1].toLowerCase()] || ''
            )
            return cb(null)
        }

        args.push(arg)
        cb(null)
    }, (err) => {
    
        if (err) return next('unknown error')

        var cmd = spawn(command.path, args)
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
            return next(err, out)
        })
    })
}
