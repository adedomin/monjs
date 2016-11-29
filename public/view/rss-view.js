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
    footer = require('./helper/footer-view'),
    title = require('./helper/title-view'),
    login = require('./helper/login-view')


module.exports = (state, prev, send) => html`
    <div>
      ${banner(state, send)}
      ${nav(state, send)}
      ${title('Notifications')}
      ${login(state, send)}

      <section class="section">
        <div class="container">
          <p>
            Below you can generate an RSS link which you can subscribe to.
            Please make sure you are using <b>TLS (SSL)</b>, otherwise your RSS link <b>will leak</b> to anyone who is listening.
          </p>
          <br>
          <label class="label">RSS/Atom link</label> 
          <p class="control has-addons">
            <input class="input is-expanded" type="text" 
              value="${window.location.href.split('#')[0]}rss/${state.rsskey}">
            <a class="button is-info" onclick=${() => send('getRss')}>
              Generate
            </a>
          </p>
        </div>
      </section>
      ${footer()}
    </div>
` 
