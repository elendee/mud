
const lib = require('../lib.js')
const log = require('../log.js')

const Persistent = require('../Persistent.js')


class AgentPersistent extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._created = lib.validate_string( init.created, init._created, undefined )
		this._edited = lib.validate_string( init.edited, init._edited, undefined )

		this.status = init.status || 'alive'

		this.health = init.health || {}

		this.health = {
			capacity: lib.validate_number( this.health.capacity, init.health_cap, 100 ),
			current: lib.validate_number( this.health.current, 100 )
		}

		this.scale = lib.validate_number( init.scale, .5 )

		this._current_zone = lib.validate_string( init._current_zone, undefined )

		this.x = lib.validate_number( init._x, init.x, 0 )
		this.y = lib.validate_number( init._y, init.y, 0 )
		this.z = lib.validate_number( init._z, init.z, 0 )

		this.ref = init.ref || {}

		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: this.x,
			y: this.y,
			z: this.z
		})

		this.ref.quaternion = lib.validate_quat( this.ref.quaternion )

	}
}



module.exports = AgentPersistent