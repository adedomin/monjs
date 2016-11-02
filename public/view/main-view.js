var html = require('choo/html'),
    banner = require('./banner-view'),
    nav = require('./nav-view'),
    footer = require('./footer-view')

module.exports = (state, prev, send) => html`
    <div>
        ${nav(state)}
        ${banner(state)}

        <section class="hero is-primary">
          <div class="hero-body">
            <div class="container">
              <h1 class="title">
                MonJS
              </h1>
            </div>
          </div>
        </section>

        <div class="columns is-gapless has-text-centered">
            <div class="column">
              <section class="section">
                <div class="container">
                  <div class="heading">
                    <h1 class="title">Status</h1>
                    <h2 class="subtitle">some num</p>
                    <a href="#host" role="button">View details »</a>
                  </div>
                </div>
              </section>
            </div>
            <div class="column">
              <section class="section">
                <div class="container">
                  <div class="heading">
                    <h1 class="title">Failing</h1>
                    <h2 class="subtitle">some num</h2>
                    <a href="#host?filter=error" role="button">View details »</a>
                  </div>
                </div>
              </section>
            </div>
            <hr>
            ${state.status}
        </div>

        ${footer()}
    </div>
`
