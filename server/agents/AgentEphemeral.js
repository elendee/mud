
const lib = require('../lib.js')
const log = require('../log.js')


class AgentEphemeral {

	constructor( init ){

		init = init || {}

		this.status = init.status || 'alive'

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

		this.health = init.health || {}

		this.health = {
			capacity: lib.validate_number( this.health, 500 ),
			current: lib.validate_number( this.health, 500 )
		}

		this.scale = lib.validate_number( init.scale, .5 )

	}
}



module.exports = AgentEphemeral