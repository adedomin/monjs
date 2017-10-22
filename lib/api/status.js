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

var express = require('express'),
    statusRoute = express.Router(),
    STATUS = require('../model/status')

var get = (req, res) => {
    if (!req.params || !req.params.host) {
        return res.send(STATUS)
    }
    if (req.params.host && !req.params.service) {
        return res.send(STATUS[req.params.host]) || {}
    }
    
    res.send(
        STATUS[req.params.host][req.params.service] || {}
    )
}

statusRoute.get('/', get)
statusRoute.get('/:host', get)
statusRoute.get('/:host/:service', get)

module.exports = statusRoute
