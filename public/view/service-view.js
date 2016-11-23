var html = require('choo/html'),
    banner = require('./helper/banner-view'),
    nav = require('./helper/nav-view'),
    card = require('./helper/card-view'),
    footer = require('./helper/footer-view'),
    title = require('./helper/title-view')

module.exports = (state, prev, send) => html`
    <div>
      ${banner(state, send)}
      ${nav()}
      ${title('Services')}

      <div class="container">
        <p class="control">
          <input
            type="text"
            class="input" 
            hint="filter by hostname"
            value="${state.filter}"
            placeholder="Filter by service"
            oninput=${(e) => send('filterChange', e.target.value)}>
        </p>
      </div>

      ${footer()}
    </div>
`
