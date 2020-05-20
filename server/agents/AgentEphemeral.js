
const lib = require('../lib.js')
const log = require('../log.js')


class AgentEphemeral {

	constructor( init ){

		init = init || {}

		this._status = init._status || 'alive'

		// this.x = lib.validate_number( init._x, init.x, 0 )
		// this.y = lib.validate_number( init._y, init.y, 0 )
		// this.z = lib.validate_number( init._z, init.z, 0 )

		this._stats = init._stats || {}
		this._stats.strength = lib.validate_number( this._stats.strength, 5 )
		this._stats.vitality = lib.validate_number( this._stats.vitality, 5 )
		this._stats.dexterity = lib.validate_number( this._stats.strength, 5 )
		this._stats.charisma = lib.validate_number( this._stats.charisma, 5 )
		this._stats.perception = lib.validate_number( this._stats.perception, 5 )
		this._stats.luck = lib.validate_number( this._stats.luck, 5 )
		this._stats.intellect = lib.validate_number( this._stats.intellect, 5 )

		this.ref = init.ref || {}
		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: lib.validate_number( init._x, init.x, 0 ),
			y: lib.validate_number( init._y, init.y, 0 ),
			z: lib.validate_number( init._z, init.z, 0 )
		})

		this.ref.quaternion = lib.validate_quat( this.ref.quaternion )

		this.health = init.health || {}
		this.health.capacity = lib.validate_number( this.health.capacity, 500 ),
		this.health.current = lib.validate_number( this.health.current, 500 )

		this.mana = init.mana || {}
		this.mana.capacity = lib.validate_number( this.mana.capacity, 500 ),
		this.mana.current = lib.validate_number( this.mana.current, 500 )

		this.scale = lib.validate_number( init.scale, .5 )

		this.logistic = this.logistic || []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('scale', 'type', 'ref') // 'x', 'y', 'z',

	}
}



module.exports = AgentEphemeral