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
    metricsRoute = express.Router(),
    errorRes = require('./helper').errorRes,
    TimeSeries = require('../model/time-series')

var timeseries = (req, res) => {
    if (!req.params || !req.params.service || !req.params.since)
        return errorRes(res, 'invalid request')

    req.params.since = new Date(req.params.since)

    if (isNaN(req.params.since.getTime()))
        return errorRes(res, 'invalid date')

    TimeSeries.find({
        service: req.params.service,
        date: { $gte: req.params.since },
    }, (err, ts) => {
        if (err || !ts) return errorRes(res, err)
        res.send(ts)
    })
}

metricsRoute.get('/:service/:since', timeseries)

module.exports = metricsRoute
