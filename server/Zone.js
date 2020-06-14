const env = require('./.env.js')
const DB = require('./db.js')
const log = require('./log.js')
const lib = require('./lib.js')

const GLOBAL = require('./GLOBAL.js')
const MAP = require('./MAP.js')

const SOCKETS = require('./SOCKETS.js')

const COMBAT = require('./combat.js')

const Persistent = require('./Persistent.js')
const Toon = require('./agents/Toon.js')
const Structure = require('./environs/Structure.js')
const Flora = require('./environs/Flora.js')

// const Loot = require('./items/Loot.js')
// const Item = require('./items/Item.js')

const ItemFactory = require('./items/FACTORY.js')

// const FLORA_FACTORY = require('./environs/FACTORY.js')

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

		this.available_flora = init.available_flora || this.generate_available_types()

		this._last_growth = lib.validate_seconds( init._last_growth, init.last_growth, new Date('1970').getTime() )// fill_growth( init )
		this._flora_target = lib.validate_number( init._flora_target, init.flora_target, 100 )
		this._structure_target = lib.validate_number( init._structure_target, init.structure_target, 50 )
		this._growth_rate = lib.validate_number( init._growth_rate, init.growth_rate, 5 )

		this._pulses = {
			move: false
		}

		this._FLORA = init._FLORA || {}
		this._STRUCTURES = init._STRUCTURES || {}
		// this._NPCS = init._NPCS || {}
		this._TOONS = init._TOONS || {}
		this._ITEMS = init._ITEMS || {}

		// this._DECOMPOSERS = init._DECOMPOSERS || {} // never persisted, so no _INSTANTIATER ^^

		this._TIMEOUTS = init._TIMEOUTS || {
			items: {},
			// decomposers: {}
		}

		this._owner = lib.validate_number( this._owner )

		// this.LOOT = init.LOOT || {}

	}


	async bring_online(){

		const zone = this

		// reads

		if( env.READ.FLORA )  await this.read_flora()

		if( env.READ.STRUCTURES )  await this.read_structures()

		// if( env.READ.STRUCTURES )  
		await this.read_items()

		// creates

		if( env.READ.FLORA ){

			const current_ISO_ms = new Date().getTime()
			// how many days since last grow:
			const growth_days = Math.floor( Math.min( GLOBAL.MAX_GROW_DAYS, ( current_ISO_ms - this._last_growth ) / ( 1000 * 60 * 60 * 24 ) ) )
			let all_new_trees = []
			let days_trees
			for( let i = 0; i < growth_days; i++ ){
				days_trees = this.grow_day()
				// log('flag', 'growday: ', days_trees )
				if( days_trees ){
					all_new_trees = all_new_trees.concat( days_trees )
				}
			}
			this._last_growth = current_ISO_ms

			if( all_new_trees.length )  await this.save_flora( all_new_trees )

			log('zone', 'new trees:', all_new_trees.length )

		}



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
					data: packet
				}))
			}

		}, GLOBAL.PULSES.MOVE )

		if( typeof( this._id ) !== 'number') {
			log('flag', 'invalid zone id', this._id )
			return false
		}

	}




	get_id(){

		if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
			log('flag', 'could not build zone id: ', this._x, this._z, this._layer )
			return false
		}

		return this._x + '-' + this._z + '-' + this._layer

	}



	get_toons( type, data ){

		const t = {}

		switch( type ){
			case 'structure':
				for( const mud_id of Object.keys( this._TOONS )){
					if( this._TOONS[ mud_id ].inside === data.inside && typeof data.inside === 'string' ){
						t[ mud_id ] = this._TOONS[ mud_id ]
					}
				}
				break;
			case 'chat':
				for( const mud_id of Object.keys( this._TOONS )){
					if( this._TOONS[ mud_id ].ref.position.distanceTo( data.position ) < MAP.CHAT_DIST && !this._TOONS[ mud_id ].inside ){
						t[ mud_id ] = this._TOONS[ mud_id ]
					}
				}
				break;
			case 'mumble_chat':
				let dist
				for( const mud_id of Object.keys( this._TOONS )){
					dist = this._TOONS[ mud_id ].ref.position.distanceTo( data.position )
					if( dist > MAP.CHAT_DIST && dist < MAP.MUMBLE_DIST && !this._TOONS[ mud_id ].inside ){
						t[ mud_id ] = this._TOONS[ mud_id ]
					}
				}
				break;
			default: break;
		}

		return t

	}



	resolve_attack( TOON, packet ){

		let slot = Number( packet.slot )

		if( slot === 2 || slot === 3 ){

			let item = TOON._INVENTORY[ TOON.equipped[ slot ] ]

			if( !item ){
				if( slot == 2 ) item = TOON.left_hand
				if( slot == 3 ) item = TOON.right_hand
			}

			let entity_type = lib.type_map[ packet.target.type ]

			if( !entity_type ) return false

			let target = this[ entity_type ][ packet.target.mud_id ]

			if( !target ){
				log('flag', 'no target found to attack', packet )
				return false
			}

			let dist = lib.get_dist( TOON.ref.position, target.ref.position )

			// let name = item.name || 'your ' + ( slot === 2 ? 'left' : 'right' ) + ' hand'

			let resolution = COMBAT.resolve({
				type: 'attack',
				attacker:TOON, 
				item: item, 
				target: target, 
				dist: dist,
				// this: this
			})

			if( resolution.status === 'dead' ){
				delete this[ entity_type ][ target.mud_id ]
				// this.add_decomposers( target )
			}
			if( resolution.loot && resolution.loot.length ){
				this.add_items( resolution.loot, target.ref.position )
			}

			this.emit('combat_resolution', SOCKETS, [], resolution )

		}else{

			log('flag', 'unknown slot type')

		}

	}




	// add_decomposers( target ){

	// 	const zone = this

	// 	if( !zone._DECOMPOSERS[ target.mud_id ]){

	// 		zone._DECOMPOSERS[ target.mud_id ] = { // can be any entity type (!)
	// 			entity: {
	// 				type: target.type,
	// 				name: lib.identify('name', target )
	// 			}
	// 		}
	// 		zone._TIMEOUTS.decomposers[ target.mud_id ] = setTimeout(function(){
	// 			delete zone._DECOMPOSERS[ target.mud_id ]
	// 			// zone.emit( 'decomposers', SOCKETS, false, zone._DECOMPOSERS )
	// 		}, 1000 * 3 ) //* 5 )

	// 		// zone.emit( 'decomposers', SOCKETS, false, zone._DECOMPOSERS )

	// 	}

	// }


	add_items( items_array, position ){

		const zone = this

		for( const item of items_array ){

			if( !zone._ITEMS[ item.mud_id ]){

				log('flag', 'droppin: ', item )

				zone._ITEMS[ item.mud_id ] = new ItemFactory( item )
				// zone._ITEMS[ item.mud_id ].ref.position = lib.validate_vec3( new Vector3(
				zone._ITEMS[ item.mud_id ].ref.position.set(
					position.x + ( -1 + Math.random() * 2 ) * 10,
					1,
					position.z + ( -1 + Math.random() * 2 ) * 10,
				)

				zone._TIMEOUTS.items[ item.mud_id ] = setTimeout(function(){
					if( zone && zone._ITEMS[ item.mud_id ] ){
						delete zone._ITEMS[ item.mud_id ]
						zone.emit( 'pong_items', SOCKETS, false, zone.bundle_items() )
					}
				}, 1000 * 60 * 5 )

			}

		}

		// log('flag', 'items now: ', zone._ITEMS )

		zone.emit( 'pong_items', SOCKETS, false, zone.bundle_items() )

	}


	bundle_items(){
		const bundle = {}
		for( const mud_id of Object.keys( this._ITEMS ) ){
			bundle[ mud_id ] = this._ITEMS[ mud_id ].publish()
		}
		return bundle
	}




	emit( type, group, exclude, packet ){

		if( typeof exclude === 'string' )  exclude = [ exclude ]

		if( !exclude ) exclude = []

		for( const mud_id of Object.keys( group )){
			if( !exclude.includes( mud_id ) ){
				SOCKETS[ mud_id ].send(JSON.stringify({
					type: type,
					data: packet
				}))
			}
		}

	}




	grow_day(){

		let projection = Object.keys( this._FLORA ).length + this._growth_rate

		let days_trees = []

		if( projection < this._flora_target ){

			let vector_attempt
			for( let i = 0; i < this._growth_rate; i++ ){
				
				vector_attempt = this.find_clearing()

				if( vector_attempt ){

					const fol = this.grow_new_flora( vector_attempt )

					this._FLORA[ fol.mud_id ] = fol
					days_trees.push( fol )
				}
			}

			return days_trees

		}else{
			return false
			log('zone', 'growth capped', Object.keys( this._FLORA ).length + '+' + this._growth_rate, this._flora_target )
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
		for( const mud_id of Object.keys( this._FLORA )){
			crnt_pos.set( 
				this._FLORA[ mud_id ].x, 
				this._FLORA[ mud_id ].y, 
				this._FLORA[ mud_id ].z 
			)
			if( crnt_pos.distanceTo( pos ) < GLOBAL.MIN_FLORA_DIST ){
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


	grow_new_flora( vector ){

		const subtype = this.available_flora[ Math.floor( Math.random() * this.available_flora.length ) ]

		const flora = new Flora({
			_zone_key: this._id,
			subtype: subtype,
			// scale: .5 + Math.random(),
			x: vector.x,
			y: vector.y,
			z: vector.z,
			// width: rand_radial,
			// length: rand_radial,
			// height: rand_vertical,
		})

		return flora

	}


	generate_available_types(){

		return ['pine', 'oak']

	}


	purge( mud_id ){

		delete this._TOONS[ mud_id ]
		log('zone', 'purged: ', mud_id )

	}


	async read_flora(){

		if( !this._id )  return false

		const pool = DB.getPool()

		const limit = this._flora_target

		const sql = 'SELECT * FROM flora WHERE zone_key=' + this._id + ' LIMIT ' + limit

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ) log('flag', 'flora looukp  err: ', error )
		for ( const flora of results ){
			let fol = new Flora( flora )
			this._FLORA[ fol.mud_id ] = fol
		}

	}


	async read_structures(){

		if( !this._id )  return false

		const pool = DB.getPool()

		// const limit = this._structure_target

		const sql = 'SELECT * FROM structures WHERE zone_key=' + this._id 

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ) log('flag', 'structure looukp  err: ', error )
		// log('flag', 'results: ', results )
		for ( const structure of results ){
			let struct = new Structure( structure )
			this._STRUCTURES[ struct.mud_id ] = struct
		}

	}



	async read_items(){

		if( !this._id )  return false

		const pool = DB.getPool()

		// const limit = this._structure_target

		const sql = 'SELECT * FROM items WHERE zone_key=' + this._id 

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ) log('flag', 'item looukp  err: ', error )
		// log('flag', 'results: ', results )
		for ( const item of results ){
			let itm = new Item( item )
			this._ITEMS[ struct.mud_id ] = itm
		}

	}



	async save_flora( value_sets ){

		// log('flag', value_sets )
		// return true

		if( !value_sets ) return true
		if( !this._id ) return false

		const pool = DB.getPool()

		for( let i = 0; i  < value_sets.length; i++ ){

			let set = value_sets[ i ]

			// if( !set.type ){
			// 	log('flag', 'wot now: ', set )
			// 	return false
			// }
			// log('flag', set )

			for( const key of Object.keys( set ) ){
				// log('flag', key, set[ key ] )
				if( typeof( set[ key ] ) === 'string' ){
					// log('flag', 'ya', set[ key ])
					set[ key ] = '"' + set[ key ] + '"'
				}
			}

			let insert_string = `
			${ set.id || 'NULL' }, 
			${ set._zone_key || 'NULL' }, 
			${ set.subtype || 'NULL' }, 
			${ set.scale || 1 }, 
			${ set.ref.position.x || 9999 }, 
			${ set.ref.position.y || 9999 }, 
			${ set.ref.position.z || 9999 },
			${ set.width || 'NULL' },
			${ set.height || 'NULL' },
			${ set.length || 'NULL' }
			`

			let update_string = `
			zone_key=${ this._id },
			subtype=${ set.subtype || 'NULL' },
			scale=${ set.scale },
			x=${ set.ref.position.x },
			y=${ set.ref.position.y },
			z=${ set.ref.position.z },
			width=${ set.width },
			height=${ set.height },
			length=${ set.length }
			`

			const sql = 'INSERT INTO `flora` (id, zone_key, subtype, scale, x, y, z, width, height, length) VALUES (' + insert_string + ') ON DUPLICATE KEY UPDATE ' + update_string

			// log('query', 'attempting UPDATE: ', insert_string, update_string )

			const { error, results, fields } = await pool.queryPromise( sql ) // blorb massive await for loop ...

			if( error || !results ){
				if( error ){
					log('flag', 'sql err:', error.sqlMessage, error.sql )
					return false
				}else{
					// throw new Error( 'UPDATE error: ', error.sqlMessage, 'attempted: ', '\nATTEMPTED: ', sql, doc._table )
					throw new Error( 'no results: ' + sql )
				}
			}

			// log('query', 'results: ', JSON.stringify( results ) )

		}

		return true

	}



	async save(){

		const update_fields = [
			'name',
			'x',
			'z',
			'layer',
			'precipitation',
			'elevation',
			'flora_target',
			'last_growth',
		]

		const update_vals = [ 
			this.name, 
			this._x,
			this._z,
			this._layer,
			this.precipitation,
			this.elevation,
			this._flora_target,
			this._last_growth,
		]

		if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
			log('flag', 'cannot identify zone for save: ', this._x, this._z, this._layer )
			return false
		}

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

	async close(){

		const zone = this

		for( const key of Object.keys( zone._TIMEOUTS )){
			for( const mud_id of Object.keys( zone._TIMEOUTS[ key ] )){
				clearTimeout( zone._TIMEOUTS[ key ][ mud_id ] )
			}
		}
		// for( const mud_id of Object.keys( zone._DECOMPOSERS )){
		// 	clearTimeout( zone._DECOMPOSERS[ mud_id ].timeout )
		// }

		log('zone', 'closing: ', zone.mud_id )
		await zone.save()
		log('zone', 'closed: ', zone.mud_id )

		return true


	}

}










module.exports = Zone