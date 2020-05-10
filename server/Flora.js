const lib = require('./lib.js')
const log = require('./log.js')

const Persistent = require('./Persistent.js')


class Flora extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'flora'

		this.subtype = init.subtype

		this.zone_key = init.zone_key

		this._table = 'flora'
		this._created = lib.validate_string( init.created, init._created, undefined )
		this._edited = lib.validate_string( init.edited, init._edited, undefined )

		this.x = lib.validate_number( init._x, init.x, 0 )
		this.y = lib.validate_number( init._y, init.y, 0 )
		this.z = lib.validate_number( init._z, init.z, 0 )

		this.ref = init.ref || {}

		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: this.x,
			y: this.y,
			z: this.z
		})

		this.health = lib.validate_number( init.health, 500 )

		this.scale = lib.validate_number( init.scale, .5 )

	}

}


module.exports = Flora