class Foliage {

	constructor( init ){

		init = init || {}

		this.zone_key = init.zone_key

		this.type = init.type

		this._x = init._x
		this._y = init._y
		this._z = init._z

		this.scale = init.scale

	}

}


module.exports = Foliage