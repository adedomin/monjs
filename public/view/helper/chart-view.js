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

var MG = require('metrics-graphics')

var graph = (timedata, filter) => {
    
    var el = document.createElement('div')
    MG.data_graphic({
        title: filter,
        data: timedata,
        width: 600,
        height: 400,
        missing_is_zero: true,
        utc_time: true,
        target: el,
        x_accessor: 'date',
        y_accessor: 'value'
    })

    return el
}

var createEl = (_timedata, filter) => {

    var timedata = _timedata
     .filter((data) => data.measure.indexOf(filter) > -1)
     .map((data) => {
         data.date = new Date(data.date)
         return data
     })

    return graph(timedata, filter)
}

module.exports = createEl
