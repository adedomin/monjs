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
    banner = require('./helper/banner-view'),
    nav = require('./helper/nav-view'),
    card = require('./helper/card-view'),
    footer = require('./helper/footer-view'),
    title = require('./helper/title-view'),
    login = require('./helper/login-view')

module.exports = (state, prev, send) => html`
    <div>
        ${banner(state, send)}
        ${nav(state, send)}
        ${title('Status')}
        ${login(state, send)}
    
        <div class="columns is-gapless has-text-centered is-multiline">
          <div class="column is-half">
            <section class="section">
              <div class="container">
                <div class="heading">
                  <h1 class="title">Status</h1>
                  <h2 class="subtitle">${state.status.length}</p>
                  <a class="button is-link" onclick=${() => send('failFilterChange', false)}>View All »</a>
                </div>
              </div>
            </section>
          </div>
          <div class="column is-half">
            <section class="section">
              <div class="container">
                <div class="heading">
                  <h1 class="title">Failing</h1>
                  <h2 class="subtitle">
                      ${state.status.filter(stat => stat.status != 'OK').length}
                  </h2>
                  <a class="button is-link" onclick=${() => send('failFilterChange', true)}>View Failing »</a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="container">
            <div class="columns is-centered is-multiline">
                ${state.status.map(stat => {
                    if (state.filterTarget == 'host' &&
                        stat.hostname.indexOf(state.filter) < 0) return 
                    else if (state.filterTarget == 'service' &&
                        stat.service.indexOf(state.filter) < 0) return 
                    if (state.failFilter && stat.status == 'OK') return
                    return html`
                        <div class="column is-one-third">
                            ${card({
                                title: stat.hostname,
                                status: stat.status,
                                subtitle: stat.service,
                                body: stat.output,
                                smallbody: `${stat.lastCheck.toLocaleTimeString()} ${stat.lastCheck.toLocaleDateString()}`
                            })}
                        </div>
                    `
                })}
            </div>
        </div>

        ${footer()}
    </div>
`
