var html = require('choo/html'),
    banner = require('./helper/banner-view'),
    nav = require('./helper/nav-view'),
    footer = require('./helper/footer-view'),
    title = require('./helper/title-view'),
    _ = require('lodash')

module.exports = (state, prev, send) => html`
    <div>
      ${banner(state, send)}
      ${nav()}
      ${title('Hosts')}

      ${(() => { if (state.modalActive) 
      return html`
      <div class="modal is-active">
        <div onclick=${() => send('cancelModal')} class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Edit host</p>
            <button onclick=${() => send('cancelModal')} class="delete"></button>
          </header>
          <div class="modal-card-body">
            <div class="section">
              <div class="container">
                <label class="label">Hostname</label>
                <p class="control">
                  <input
                   class="input" 
                   type="text" 
                   value="${state.modalForm.name}"
                   oninput=${(e) => send('modalFormChange', { name: e.target.value })}>
                </p>
                <label class="label">Address</label>
                <p class="control">
                  <input
                   class="input" 
                   type="text" 
                   value="${state.modalForm.address}"
                   oninput=${(e) => send('modalFormChange', { address: e.target.value })}>
                </p>
                ${_.keys(state.modalForm.extra_vars).map((key) => html`
                    <div>
                    <label class="label">${key}</label>
                    <p class="control has-addons">
                      <input
                       class="input is-expanded"
                       type="text"
                       value="${state.modalForm.extra_vars[key]}"
                       oninput=${(e) => send('modalFormExtraChange', { [key]: e.target.value })}>
                      <a onclick=${() => send('modalExtraDelete', key)} 
                       class="button is-danger">
                        Delete
                      </a>
                    </p>
                    </div>
                `)}
                <label class="label">Add variable</label>
                <p class="control has-addons">
                  <input
                   id="addextra"
                   hint="add extra variable"
                   class="input is-expanded"
                   type="text">
                  <a onclick=${() => send('modalExtraAdd', 
                      document.getElementById('addextra').value
                  )} class="button is-info">
                    Add
                  </a>
                </p>
              </div>
            </div>
            </div>
            </div>
          </div>
          <footer class="modal-card-foot">
            <a onclick=${() => send('addObject', 'host')} class="button is-success">
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
          ${state.hosts.map((host) => html`
              <div class="column is-3">
                <div class="box">
                  <div class="content">
                    <p>
                      <strong>${host.name}</strong> <small>${host.address}</small>
                    </p>
                    <div class="control is-grouped">
                    <p class="control">
                      <a onclick=${() => send('enableModal', host)} class="button">
                        Edit
                      </a>
                    </p>
                    <p class="control">
                      <a onclick=${() => send('delObject', `host/${host.name}`) } 
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
                      <strong>Add New Host</strong>
                    </p>
                    <p>
                      <a 
                       class="button is-info"
                       onclick=${() => send('enableModal', 
                           { 
                               name: '', 
                               address: '', 
                               extra_vars: {} 
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
