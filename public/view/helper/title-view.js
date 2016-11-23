var html = require('choo/html')

module.exports = (title) => html`
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            MonJS - ${title}
          </h1>
        </div>
      </div>
    </section>
`
