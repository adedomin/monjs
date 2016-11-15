/*
 * Copyright (C) 2016 Anthony DeDominic <anthony@dedominic.pw>
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

module.exports = {
    statusChange: (data, state) => {
        return Object.assign({}, state, { status: data })
    },
    hostChange: (data, state) => {
        return Object.assign({}, state, { hosts: data })
    },
    serviceChange: (data, state) => {
        return Object.assign({}, state, { services: data })
    },
    errorBanner: (data, state) => {
        return Object.assign({}, state, { 
            bannertype: 'danger', banner: data
        }) 
    },
    okBanner: (data, state) => {
        return Object.assign({}, state, { 
            bannertype: 'success', banner: data 
        })
    },
    clearBanner: (data, state) => {
        return Object.assign({}, state, {
            bannertype: 'info', banner: ''
        })
    }
}
