var html = require('choo/html'),
    banner = require('./helper/banner-view'),
    nav = require('./helper/nav-view'),
    footer = require('./helper/footer-view'),
    title = require('./helper/title-view')

module.exports = (state, prev, send) => html`
    <div>
      ${banner(state, send)}
      ${nav()}
      ${title('Services')}

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
                       args: e.target.value.split(/\s+(?=(?:[^\'\"]*[\'\"][^\'\"]*[\'\"])*[^\'\"]*$)/)
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
                          interval:  +e.target.value * +state.modalForm.time 
                      })}>
                      <option value="1">Milisecond</option>
                      <option value="1000">Second</option>
                      <option value="60000">Minute</option>
                      <option value="3600000">Hour</option>
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
              <span class="icon">
                <i class="fa fa-check"></i>
              </span>
              <span>Save</span>
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
          ${state.services.map((service) => html`
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
                       onclick=${() => send('enableModal', { 
                           name: '', 
                           host: '',
                           command: '',
                           argstring: '',
                           args: [],
                           time: 0,
                           interval: 0 
                       })}>
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
