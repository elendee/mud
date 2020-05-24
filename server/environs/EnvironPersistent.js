
const lib = require('../lib.js')
const log = require('../log.js')

const Persistent = require('../Persistent.js')

// const Item = require('../items/Item.js')
const FACTORY = require('../items/FACTORY.js')

const LOOT = require('./LOOT.js')

class EnvironPersistent extends Persistent {

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
		// this.x = lib.validate_number( init._x, init.x, 0 )
		// this.y = lib.validate_number( init._y, init.y, 0 )
		// this.z = lib.validate_number( init._z, init.z, 0 )

		this.ref = init.ref || {}

		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: lib.validate_number( init._x, init.x, 0 ),
			y: lib.validate_number( init._y, init.y, 0 ),
			z: lib.validate_number( init._z, init.z, 0 )
		})

		this.width = lib.validate_number( init.width, 5 )
		this.height = lib.validate_number( init.height, 5 )
		this.length = lib.validate_number( init.length, 5 )

		this.ref.quaternion = lib.validate_quat( this.ref.quaternion )

		this.logistic = this.logistic || []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('scale', 'type', 'ref') // 'x', 'y', 'z'

	}

	drop_loot(){

		let loot = []

		const types = LOOT[ lib.identify( 'name', this ) ]

		for( const key of types ){

			// log('flag', 'loots: ', type )

			let init = {
				type: 'resource',
				subtype: key
			}

			loot.push( new FACTORY( init ) )

		}

		// log('flag', 'loots: ', loot )

		return loot

	}

}



module.exports = EnvironPersistent