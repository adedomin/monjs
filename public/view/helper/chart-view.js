/*
 * Copyright (C) 2016  prussian <genunrest@gmail.com>
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

var widget = require('cache-element/widget'),
    html = require('choo/html'),
    MG = require('metrics-graphics')

module.exports = widget((update) => {
    var timedata = null
    update(onupdate)

    return html`
        <div class="is-centered" id="perfdata-graph">
            <div onload=${onload} onunload=${onunload}></div>
        </div>
    `

    function onupdate (_timedata, filter) {
        timedata = _timedata
                    .filter((data) => data.measure == filter)
                    .map((data) => {
                        data.date = new Date(data.date)
                        return data
                    })
    }

    function onload () {
        MG.data_graphic({
            title: 'perfdata',
            data: timedata,
            width: 600,
            height: 400,
            missing_is_zero: true,
            utc_time: true,
            target: document.getElementById('perfdata-graph'),
            x_accessor: 'date',
            y_accessor: 'value'
        })
    }

    function onunload () {
        timedata = null
    }
})
