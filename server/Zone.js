const DB = require('./db.js')
const log = require('./log.js')
const lib = require('./lib.js')

const GLOBAL = require('./GLOBAL.js')
const MAP = require('./MAP.js')

const SOCKETS = require('./SOCKETS.js')

const Persistent = require('./Persistent.js')
const Toon = require('./Toon.js')
const Structure = require('./Structure.js')
const Foliage = require('./Foliage.js')

const {
	Vector3
} = require('three')


class Zone extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'zones'

		this.name = init.name

		this._x = lib.validate_number( init._x, init.x, 0 )
		this._z = lib.validate_number( init._z, init.z, 0 )
		this._layer = lib.validate_number( init._layer, init.layer, 0 )


		this.elevation = lib.validate_number( this.elevation, 1 )
		this.precipitation = lib.validate_number( init.precipitation, 1 )

		this._last_growth = lib.validate_seconds( init._last_growth, init.last_growth, new Date('1970').getTime() )// fill_growth( init )
		this._foliage_target = lib.validate_number( init._foliage_target, init.foliage_target, 100 )
		this._growth_rate = lib.validate_number( init._growth_rate, init.growth_rate, 5 )

		this._pulses = {
			move: false
		}

		this._FOLIAGE = init.FOLIAGE || {}
		this._STRUCTURES = init.STRUCTURES || {}
		this._NPCS = init.NPCS || {}
		this._TOONS = init.TOONS || {}

	}

	get_id(){

		if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
			log('flag', 'could not build zone id: ', this._x, this._z, this._layer )
			return false
		}

		return this._x + '-' + this._z + '-' + this._layer

	}

	async bring_online(){

		const zone = this

		// reads

		await this.read_foliage()

		await this.read_structures()

		// grow

		const current_ISO_ms = new Date().getTime()
		const growth_days = Math.floor( Math.min( GLOBAL.MAX_GROW_DAYS, ( current_ISO_ms - this._last_growth ) / ( 1000 * 60 * 60 * 24 ) ) )
		for( let i = 0; i < growth_days; i++ ){
			this.grow_day()
		}
		this._last_growth = current_ISO_ms

		await this.save_foliage()

		// pulses

		this._pulses.move = setInterval(function(){

			let packet = {}

			for( const mud_id of Object.keys( zone._TOONS )){
				packet[ mud_id ] = {
					position: zone._TOONS[ mud_id ].ref.position,
					quaternion: zone._TOONS[ mud_id ].ref.quaternion
				}
			}

			for( const mud_id of Object.keys( SOCKETS ) ){
				SOCKETS[ mud_id ].send( JSON.stringify({
					type: 'move_pulse',
					packet: packet
				}))
			}

		}, GLOBAL.PULSES.MOVE )

		if( typeof( this._id ) !== 'number') {
			log('flag', 'invalid zone id', this._id )
			return false
		}

	}


	grow_day(){

		let projection = Object.keys( this._FOLIAGE ).length + this._growth_rate

		if( projection < this._foliage_target ){

			let attempt
			for( let i = 0; i < this._growth_rate; i++ ){
				
				attempt = this.find_clearing()

				if( attempt ){
					const fol = new Foliage({
						type: 'tree',
						scale: .5 + Math.random(),
						x: attempt.x,
						y: attempt.y,
						z: attempt.z
					})
					this._FOLIAGE[ fol.mud_id ] = fol
				}
			}

		}else{
			log('zone', 'growth capped', Object.keys( this._FOLIAGE ).length + '+' + this._growth_rate, this._foliage_target )
		}

	}


	find_clearing(){

		let pos = new Vector3( 
			Math.random() * MAP.ZONE_WIDTH, 
			1, 
			Math.random() * MAP.ZONE_WIDTH 
		)

		let crnt_pos = new Vector3()
		let bumped = false
		for( const mud_id of Object.keys( this._FOLIAGE )){
			crnt_pos.set( 
				this._FOLIAGE[ mud_id ].x, 
				this._FOLIAGE[ mud_id ].y, 
				this._FOLIAGE[ mud_id ].z 
			)
			if( crnt_pos.distanceTo( pos ) < GLOBAL.MIN_FOLIAGE_DIST ){
				bumped = true
				continue
			}
		}

		if( bumped ){
			return false
		}else{
			return {
				x: pos.x,
				y: pos.y,
				z: pos.z
			}
		}

	}


	async read_foliage(){

		const pool = DB.getPool()

		const sql = 'SELECT * FROM foliage WHERE zone_key=' + this._id

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ) log('flag', 'foliage looukp  err: ', error )
		for ( const foliage of results ){
			let fol = new Foliage( foliage )
			this._FOLIAGE[ fol.mud_id ] = fol
		}

	}


	async read_structures(){

		const pool = DB.getPool()

		const sql = 'SELECT * FROM structures WHERE zone_key=' + this._id

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ) log('flag', 'structure looukp  err: ', error )
		for ( const structure of results ){
			let struct = new Structure( structure )
			this._STRUCTURES[ struct.mud_id ] = struct
		}

	}



	async save_foliage(){

		log('flag', '-----------incomplete save_foliage')
		return false

		const pool = DB.getPool()

		let value_string

		const sql = 'INSERT INTO `foliage` (zone_key, type, scale, x, y, z) VALUES ' + value_string + ' ON DUPLICATE KEY UPDATE ' + full_string

		log('query', 'attempting UPDATE: ', sql )

		const { error, results, fields } = await pool.queryPromise( sql )

		if( error || !results ){
			if( error ){
				log('flag', 'sql err:', error.sqlMessage )
				return false
			}else{
				// throw new Error( 'UPDATE error: ', error.sqlMessage, 'attempted: ', '\nATTEMPTED: ', sql, doc._table )
				throw new Error( 'no results: ' + sql )
			}
		}

		log('query', 'results: ', JSON.stringify( results ) )

		return {
			msg: 'sql success',
			id: results.insertId
		}

	}



	async save(){

		const update_fields = [
			'name',
			'x',
			'z',
			'layer',
			'precipitation',
			'elevation',
			'foliage_target',
			'last_growth'
		]

		const update_vals = [ 
			this.name, 
			this._x,
			this._z,
			this._layer,
			this.precipitation,
			this.elevation,
			this._foliage_target,
			this._last_growth
		]

		if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
			log('flag', 'cannot identify zone for save: ', this._x, this._z, this._layer )
			return false
		}

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

	close(){

		log('flag', 'closing zone: ', this.mud_id )

	}

}










module.exports = Zone