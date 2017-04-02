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
    login = require('./helper/login-view'),
    shlex = require('shell-quote').parse,
    unit_values = {
        Milisecond: 1,
        Second: 1000,
        Minute: 60000,
        Hour: 3600000
    }

module.exports = (state, prev, send) => html`
    <div>
      ${banner(state, send)}
      ${nav(state, send)}
      ${title('Services')}
      ${login(state, send)}

      ${(() => { if (state.modalActive) return html`
      <div class="modal is-active">
        <div onclick=${() => send('cancelModal')} class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Edit service</p>
            <button onclick=${() => send('cancelModal')} class="delete"></button>
          </header>
          <div class="modal-card-body">
            <div class="section">
              <div class="container">
                <label class="label">Service name</label>
                <p class="control">
                  <input
                   class="input" 
                   type="text" 
                   value="${state.modalForm.name}"
                   oninput=${(e) => send('modalFormChange', { name: e.target.value })}>
                </p>
                <label class="label">Host</label>
                <p class="control">
                  <span class="select">
                     <select 
                      onchange=${(e) => send('modalFormChange', { host: e.target.value })}>
                      ${state.hosts.map((host) => {
                          if (state.modalForm.host == host.name) return html`
                            <option selected value="${host.name}">${host.name}</option>
                          `
                          return html`
                            <option value="${host.name}">${host.name}</option>
                          `
                      })}
                    </select>
                  </span>
                </p>
                <label class="label">Command</label>
                <p class="control">
                  <input
                   class="input" 
                   type="text" 
                   value="${state.modalForm.command}"
                   oninput=${(e) => send('modalFormChange', { command: e.target.value })}>
                </p>
                <label class="label">args (space or string delimited)</label>
                <p class="control">
                  <input
                   class="input" 
                   type="text" 
                   value="${state.modalForm.argstring}"
                   oninput=${(e) => send('modalFormChange', { 
                       argstring: e.target.value,
                       args: shlex(
                           e.target.value.replace(/\$/g, '\\$')
                       )
                   })}>
                </p>
                <label class="label">Interval</label>
                <p class="control has-addons">
                  <input
                   class="input is-expanded" 
                   type="number"
                   value="${state.modalForm.time}"
                   oninput=${(e) => send('modalFormChange', { 
                       time: +e.target.value,
                       interval: +e.target.value * +document.getElementById('intervalUnit').value
                   })}></input>
                   <span class="select">
                     <select 
                      id="intervalUnit"
                      onchange=${(e) => send('modalFormChange', {
                          interval:  +e.target.value * +state.modalForm.time,
                          unit: e.target.options[e.target.selectedIndex].text
                      })}>
                      ${Object.keys(unit_values).map(val => {
                          if (state.modalForm.unit == val) {
                              return html`<option selected value="${unit_values[val]}">${val}</option>
                              `
                          }
                          return html`<option value="${unit_values[val]}">${val}</option>
                          `
                      })}
                    </select>
                  </span>
                </p>
              </div>
            </div>
            </div>
            </div>
            </div>
          </div>
          <footer class="modal-card-foot">
            <a onclick=${() => send('addObject', 'service')} class="button is-success">
              Save
            </a>
            <a onclick=${() => send('cancelModal')} class="button">
              Cancel
            </a>
          </footer>
        </div>
        </div>
      </div>`})()}

      <br>

      <div class="container">
        <div class="columns is-centered is-multiline">
          ${state.services.filter(service => {
              return service.name.indexOf(state.filter) > -1
                     || state.filterTarget != 'service'
          }).map(service => html`
              <div class="column is-3">
                <div class="box">
                  <div class="content">
                    <p>
                      <strong>${service.name}</strong> <small>${service.host}</small>
                    </p>
                    <p>
                        ${service.command} - ${service.interval} ms
                    </p>
                    <div class="control is-grouped">
                    <p class="control">
                      <a onclick=${() => send('enableModal', service)} class="button">
                        Edit
                      </a>
                    </p>
                    <p class="control">
                      <a onclick=${() => send('delObject', `service/${service._id}`) } 
                       class="button is-danger">
                        Delete
                      </a>
                    </p>
                    </div>
                  </div>      
                </div>
              </div>
          `)}
            <div class="column is-3">
                <div class="box">
                  <div class="content">
                    <p>
                      <strong>Add New Service</strong>
                    </p>
                    <p>
                      <a 
                       class="button is-info"
                       onclick=${() => {
                           var hostname = ''
                           if (state.hosts[0] && state.hosts[0].name) 
                               hostname = state.hosts[0].name
                           send('enableModal', { 
                               name: '', 
                               host: hostname,
                               command: '',
                               argstring: '',
                               args: [],
                               time: 0,
                               interval: 0 
                           })
                       }}>
                        Add  
                      </a>
                    </p>
                  </div>      
                </div>
              </div>
        </div>
      </div>

      ${footer()}
    </div>
`
