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
    status_colors = require('../../lib/status-colors')

module.exports = (data) => html`
  <div class="card is-fullwidth">
    <header class="card-header">
      <p class="card-header-title">
        <span class="tag is-${status_colors[data.status] || 'dark'}">
            ${data.title} - ${data.subtitle}
        </span>
      </p>
    </header>
    <div class="card-content">
      <div class="content">
        ${data.body} 
        <br>
        <small>${data.smallbody}</small>
      </div>
    </div>
    <footer class="card-footer">
      <a href="#/metrics/${data.title}" class="card-footer-item">View Timeseries</a>
      <a class="card-footer-item">Recheck Service</a>
    </footer>
  </div>
`
