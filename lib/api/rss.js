/*
 * Copyright (C) 2017  Anthony DeDominic <adedomin@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var errorRes = require('./helper').errorRes,
    Feed = require('feed'), 
    Auth = require('../model/auth'),
    RSSFeed = require('../model/rss'),
    config = require(process.env.CONFIG_PATH)

module.exports = (req, res) => {
    Auth.findOne({ key: req.params.secret }, (err, key) => {
        if (err || !key) return errorRes(res, 'not authorized to view this feed', 403)

        var feed = new Feed({
            title: 'MonJS',
            description: 'Warning and Error Feed',
            link: `${config.http.hostname}${config.http.root}/#/`,
            id: 'monjs-feed',
        })

        RSSFeed.toarray().forEach(feeditem => feed.addItem(feeditem))

        res.type('application/atom+xml')
        res.send(feed.render('atom-1.0'))
    })
}
