const Persistent = require('./Persistent.js')


class Foliage extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.zone_key = init.zone_key

		this.type = init.type

		this.x = typeof( init._x ) === 'number' ? init._x : init.x
		this.y = typeof( init._y ) === 'number' ? init._y : init.y
		this.z = typeof( init._z ) === 'number' ? init._z : init.z

		this.scale = init.scale

	}

}


module.exports = Foliage