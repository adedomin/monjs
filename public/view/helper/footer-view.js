/*
 * Copyright 2016 prussian <genunrest@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var html = require('choo/html')

module.exports = () => {
    return html`
        <footer class="footer">
          <div class="container">
            <div class="content has-text-centered">
              <p>
                <strong>MonJS</strong> by <a href="https://dedominic.pw">Anthony DeDominic</a>.
              </p>
              <p>
                <a class="icon" href="https://github.com/GeneralUnRest/ezios">
                    <img src="Github-Mark-120px-plus.png">
                </a>
              </p>
            </div>
          </div>
        </footer>
    `
}
