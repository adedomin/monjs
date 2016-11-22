#!/usr/bin/env node
/*
 * Copyright (C) 2016 Anthony DeDominic
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

var stdio = require('stdio'),
    fs = require('fs'),
    request = require('request'),
    file = null

var verbs = {
    'add-host': (file, opts) => {},
    'add-service': (file, opts) => {},
    'get-host': (file, opts) => {},
    'get-service': (file, opts) => {},
    'del-host': (file, opts) => {},
    'del-service': (file, opts) => {}
}

var opts = stdio.getopt({
    hostname: { key: 'H', args: 1, description: 'hostname' },
    address: { key: 'a', args: 1, description: 'address' },
    servicename: { key: 's', args: 1, description: 'service name' },
    command: { key: 'c', args: 1, description: 'service command'},
    argument: { key: 'a', args: '*', description: 'arguments for command'},
    interval: { key: 'i', args: 1, description: 'frequency to run command'},
    extras: { key: 'e', args: '*', description: 'extra host vars, key:value pairs, colon delimits key from value' },
    _meta_: { minArgs: 1 }
})

if (!verbs[opts.args[0]]) {
    console.log`invalid verb
    must be one of:
        add-host 
        add-service
        get-host
        get-service
        del-host 
        del-service
    `
}

if (opts.args[1] && opts.args[1] == '-') {
    file = process.stdin
}
else if (!opts.args[1] && fs.statSync(opts.args[1]).isFile()) {
    file = fs.createReadstream(opts.args[1])
}

verbs[opts.args[0]](opts, file)
