var html = require('choo/html'),
    banner = require('./banner-view.js')

module.exports = (state, prev, send) => html`
    <div>
        ${banner(state)}
        <div class="jumbotron">
            <h1>MonJS</h1>
        </div>

        <div class="row">
            <div class="col-xs-6">
                <h2>Status</h2>
                <p>some num</p>
                <a class="btn btn-secondary" href="#host" role="button">View details »</a>
            </div>
            <div class="col-xs-6">
                <h2>Failing</h2>
                <p>some num</p>
                <a class="btn btn-secondary" href="#host?filter=error" role="button">View details »</a>
            </div>
            ${state.status}
        </div>
    </div>
`
