var html = require('choo/html'),
    banner = require('./banner-view'),
    nav = require('./nav-view'),
    card = require('./card-view'),
    footer = require('./footer-view')

module.exports = (state, prev, send) => html`
    <div>
        ${banner(state, send)}
        ${nav()}

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
                    <h2 class="subtitle">${state.status.length}</p>
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
                    <h2 class="subtitle">
                        ${state.status.filter(stat => stat.status != 'OK').length}
                    </h2>
                    <a href="#host?filter=error" role="button">View details »</a>
                  </div>
                </div>
              </section>
            </div>
            <hr>
        </div>

        <div class="container">
            <div class="columns is-multiline">
                ${state.status.map(stat => {
                    return html`
                        <div class="column is-one-third">
                            ${card({
                                title: stat.hostname,
                                status: stat.status,
                                subtitle: stat.service,
                                body: stat.output,
                                smallbody: stat.perfdata || 'no perfdata',
                                link: [ 'nowhere', 'nowhere' ]
                            })}
                        </div>
                    `
                })}
            </div>
        </div>

        ${footer()}
    </div>
`
