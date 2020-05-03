const lib = require('./lib.js')

const Persistent = require('./Persistent.js')


class Flora extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.zone_key = init.zone_key

		this.type = init.type

		this._table = 'flora'
		this._created = lib.validate_string( init.created, init._created, undefined )
		this._edited = lib.validate_string( init.edited, init._edited, undefined )

		this.x = lib.validate_number( init._x, init.x, 0 )
		this.y = lib.validate_number( init._y, init.y, 0 )
		this.z = lib.validate_number( init._z, init.z, 0 )

		this.scale = lib.validate_number( init.scale, .5 )

	}

}


module.exports = Flora