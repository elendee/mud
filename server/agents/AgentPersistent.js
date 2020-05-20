
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

		this._stats = init._stats || {}
		this._stats.strength = lib.validate_number( this._stats.strength, 5 )
		this._stats.vitality = lib.validate_number( this._stats.vitality, 5 )
		this._stats.dexterity = lib.validate_number( this._stats.strength, 5 )
		this._stats.charisma = lib.validate_number( this._stats.charisma, 5 )
		this._stats.perception = lib.validate_number( this._stats.perception, 5 )
		this._stats.luck = lib.validate_number( this._stats.luck, 5 )
		this._stats.intellect = lib.validate_number( this._stats.intellect, 5 )

		this.health = init.health || {}
		this.health.capacity = lib.validate_number( this.health.capacity, init.health_cap, this.calculate_health() )
		this.health.current = lib.validate_number( this.health.current, this.health.capacity, 1 )

		this.mana = init.mana || {}
		this.mana.capacity = lib.validate_number( this.mana.capacity, init.mana_cap, this.calculate_mana() )
		this.mana.current = lib.validate_number( this.mana.current, this.mana.capacity, 1 )

		// this.scale = lib.validate_number( init.scale, .5 )

		this._current_zone = lib.validate_string( init._current_zone, undefined )

		// straight from db vals:
		// this.x = lib.validate_number( init._x, init.x, 0 )
		// this.y = lib.validate_number( init._y, init.y, 0 )
		// this.z = lib.validate_number( init._z, init.z, 0 )

		this.ref = init.ref || {}

		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: lib.validate_number( init._x, init.x, 0  ),
			y: lib.validate_number( init._y, init.y, 0  ),
			z: lib.validate_number( init._z, init.z, 0  )
		})

		this.width = lib.validate_number( init.width, 5 )
		this.height = lib.validate_number( init.height, 5 )
		this.length = lib.validate_number( init.length, 5 )

		this.ref.quaternion = lib.validate_quat( this.ref.quaternion )

		this.logistic = this.logistic || []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push( 'type', 'ref', 'width', 'height', 'length') // 'x', 'y', 'z', 'scale',

	}

	calculate_health(){

		return this._stats.vitality * 50

	}

	calculate_mana(){

		return this._stats.intellect * 50

	}

}



module.exports = AgentPersistent