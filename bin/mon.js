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
    request = require('request')

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
