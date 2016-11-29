var html = require('choo/html')

module.exports = (state, send) => {
    if (!state.auth) return html`
      <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-content">
          <div class="box">
            <p class="control has-addons">
              <input class="input is-expanded" id="secret"
                type="password" onkeydown=${(e) => { 
                    if (e.keyCode == 13) 
                        send('testAuth', document.getElementById('secret').value) 
                }}></input>
              <a class="button is-info"
                 onclick=${() => send('testAuth', document.getElementById('secret').value)}>
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    `
}
