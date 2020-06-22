
const env = require('../.env.js')
const lib = require('../lib.js')
const log = require('../log.js')

const DB = require('../db.js')

const Persistent = require('../Persistent.js')

const { Vector3 } = require('three')


class AgentPersistent extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._created = lib.validate_string( init.created, init._created, undefined )
		this._edited = lib.validate_string( init.edited, init._edited, undefined )

		this._status = init._status || 'alive'

		this.name = init.name || 'Toon_' + lib.random_hex(4)

		// log('flag', 'toon has strings ya: ', init._stats )

		this._stats = init._stats || {}
		this._stats.strength = lib.validate_number( this._stats.strength, init.strength, 5 )
		this._stats.vitality = lib.validate_number( this._stats.vitality, init.vitality, 5 )
		this._stats.dexterity = lib.validate_number( this._stats.strength, init.strength, 5 )
		this._stats.perception = lib.validate_number( this._stats.perception, init.perception, 5 )
		this._stats.luck = lib.validate_number( this._stats.luck, init.luck, 5 )
		this._stats.intellect = lib.validate_number( this._stats.intellect, init.intellect, 5 )
		this._stats.speed = lib.validate_number( this._stats.speed, init.speed, env.FALLBACK_TOON_SPEED )

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

		this._scratch = {
			facing: new Vector3(1, 0, 0),
			projection: new Vector3()
		}

		this.ref = init.ref || {}

		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: lib.validate_number( init._x, init.x, 0  ),
			y: lib.validate_number( init._y, init.y, 0  ),
			z: lib.validate_number( init._z, init.z, 0  )
		})

		this.width = lib.validate_number( init.width, 5 )
		this.height = lib.validate_number( init.height, 5 )
		this.length = lib.validate_number( init.length, 5 )

		this.intervals = {
			attack: {
				left: false,
				right: false,
			}
		}

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

	die(){

		this._status = 'dead'

		if( this._objective ){

			this._objective.void( this )

			this.clear_intervals( this.intervals )

		}

		if( !this._table || !this._id ){
			log('flag', 'invalid die DELETE', this._table + '___ ' + this._id )
			return false
		}

		const pool = DB.getPool()

		pool.query( 'DELETE FROM ' + this._table + ' WHERE id=' + this._id, (error, results, fields) => {
			if( error ){
				log('flag', 'err killing agent', error )
				return false
			}
			log('flag', 'agent die result: ', results )
			// resolve({ error, results, fields })
		})

	}

	clear_intervals(){

		const obj = this.intervals

		for( const key of Object.keys( obj ) ){ // clear all intervals
			if( typeof obj[ key ] === 'number' ){
				clearInterval( obj[ key ] )
			}else if( typeof obj[ key ] === 'object' ){
				for( const subkey of Object.keys( obj[key]) ){
					clearInterval( obj[ key ][ subkey ] )
				}
			}
		}

	}

}



module.exports = AgentPersistent