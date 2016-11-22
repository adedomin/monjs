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
                MonJS - Status Page
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
                    <button class="button is-link" onclick=${() => send('failFilterChange', false)}>View All »</a>
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
                    <button class="button is-link" onclick=${() => send('failFilterChange', true)}>View Failing »</a>
                  </div>
                </div>
              </section>
            </div>
            <hr>
        </div>

        <div class="container">
            <p class="control has-addons">
              <span class="select">
                <select onchange=${(e) => send('filterTargetChange', e.target.value)}>
                  <option value="host">host</option>
                  <option value="service">service</option>
                </select>
              </span>
              <input
                type="text"
                class="input is-expanded" 
                hint="filter by hostname"
                value="${state.filter}"
                placeholder="Filter by ${state.filterTarget}"
                oninput=${(e) => send('filterChange', e.target.value)}>
            </p>
        </div>

        <div class="container">
            <div class="columns is-multiline">
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
