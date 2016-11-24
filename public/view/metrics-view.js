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

var html = require('choo/html'),
    graph = require('./helper/chart-view'),
    banner = require('./helper/banner-view'),
    nav = require('./helper/nav-view'),
    footer = require('./helper/footer-view'),
    title = require('./helper/title-view'),
    _ = require('lodash')

module.exports = (state, prev, send) => html`
    <div>
      ${banner(state, send)}
      ${nav()}
      ${title(`Metrics - ${state.params.service}`)}
      
      <div class="columns is-gapless">
        <div class="column">
          <section class="section">
            <div class="container">
              <label class="label">Time Since</label>
              <p class="control">
                <span class="select">
                  <select id="timeseries-select"
                   oninput=${(e) => send('getTimeSeries', { 
                       since: +e.target.value, 
                       service: encodeURIComponent(state.params.service)
                   })}>
                    <option value="3600000">
                      hour
                    </option>
                    <option value="86400000">
                      day
                    </option>
                    <option value="604800000">
                      week
                    </option>
                    <option value="2592000000">
                      month
                    </option>
                  </select>
                </span>
              </p>
              <label class="label">Perfdata</label>
              <p class="control">
                <select id="filterSeries-select"
                 oninput=${(e) => send('filterSeriesChange', e.target.value)}>
                  ${_.map(_.uniqBy(state.timeseries, 'measure'), (uniq) => {
                      return uniq.measure 
                  }).map((measure) => html`
                      <option value="${measure}">${measure}</option>
                  `)}  
                </select>
              </p>
            </div>
          </section>
        </div>
        <div class="column">
          <section class="section">
            <div class="container">
              ${graph(state.timeseries, state.filterSeries)}
            </div>
          </section>
        </div>
      </div>

      ${footer()}
    </div>
`
