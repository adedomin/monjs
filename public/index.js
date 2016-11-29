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

// css
require('../node_modules/bulma/css/bulma.css')

var choo = require('choo'),
    app = choo()

app.model(require('./model/main-model'))

app.router('/status', (route) => [
    route('/status', require('./view/status-view')),
    route('/host', require('./view/host-view'), [
        route('/:hostname', require('./view/host-view'))
    ]),
    route('/service', require('./view/service-view'), [
        route('/:service', require('./view/service-view'))
    ]),
    route('/metrics/:service', require('./view/metrics-view')),
    route('/notify', require('./view/rss-view')),
])

var tree = app.start({ hash: true })
document.body.appendChild(tree)
