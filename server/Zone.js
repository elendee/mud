const Toon = require('./Toon.js')

class Zone {

	constructor( init ){

		init = init || {}

		this.name = init.name

		this._x = init._x
		this._y = init._y
		this._z = init._z

		this.precipitation = init.precipitation || 1

	}

}



module.exports = Zone