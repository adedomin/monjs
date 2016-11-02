/*
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
var html = require('choo/html')

module.exports = (state, send) => {
    if (state.banner == '') return
    return html`
        <section class="hero is-${state.bannertype}">
          <div class="hero-body">
            <a class="button is-link is-pulled-right" onclick=${() => send('clearBanner')}>x</a>
            <div class="container">
              <h1 class="subtitle">
                ${state.banner}
              </h1>
            </div>
          </div>
        </section>
    `
}


