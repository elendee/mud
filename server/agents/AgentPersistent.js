
const lib = require('../lib.js')
const log = require('../log.js')

const Persistent = require('../Persistent.js')


class AgentPersistent extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._created = lib.validate_string( init.created, init._created, undefined )
		this._edited = lib.validate_string( init.edited, init._edited, undefined )

		this._status = init._status || 'alive'

		this.health = init.health || {}

		this.health = {
			capacity: lib.validate_number( this.health.capacity, init.health_cap, 100 ),
			current: lib.validate_number( this.health.current, 100 )
		}

		this.scale = lib.validate_number( init.scale, .5 )

		this._current_zone = lib.validate_string( init._current_zone, undefined )

		// straight from db vals:
		this.x = lib.validate_number( init._x, init.x, 0 )
		this.y = lib.validate_number( init._y, init.y, 0 )
		this.z = lib.validate_number( init._z, init.z, 0 )

		this.ref = init.ref || {}

		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: this.x,
			y: this.y,
			z: this.z
		})

		this.width = lib.validate_number( init.width, 5 )
		this.height = lib.validate_number( init.height, 5 )
		this.length = lib.validate_number( init.length, 5 )

		this.ref.quaternion = lib.validate_quat( this.ref.quaternion )

		this.logistic = this.logistic || []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('scale', 'type', 'x', 'y', 'z', 'ref')

	}
}



module.exports = AgentPersistent