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
const Npc = require('./agents/Npc.js')
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
		// this._AGENTS = init._AGENTS || {}
		this._NPCS = init._NPCS || {}

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
		if( env.READ.NPCS ) await this.read_npcs()

		await this.read_items()

		// creates

		if( env.READ.FLORA ){

			const current_ISO_ms = new Date().getTime()
			const growth_days = Math.floor( Math.min( GLOBAL.MAX_GROW_DAYS, ( current_ISO_ms - this._last_growth ) / ( 1000 * 60 * 60 * 24 ) ) )
			let all_new_trees = []
			let days_trees
			for( let i = 0; i < growth_days; i++ ){
				days_trees = this.grow_day()
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

			zone.emit( 'move_pulse', SOCKETS, false, packet )

			let npc_packet = {}

			for( const mud_id of Object.keys( zone._NPCS )){

				if( !zone._NPCS[ mud_id ]._objective ){
					zone._NPCS[ mud_id ].idle( zone )
				}else{
					zone._NPCS[ mud_id ].move( zone )
				}

				npc_packet[ mud_id ] = {
					position: zone._NPCS[ mud_id ].ref.position,
					quaternion: zone._NPCS[ mud_id ].ref.quaternion
				}

			}

			zone.emit( 'npc_move_pulse', SOCKETS, false, npc_packet )

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



	resolve_attack( AGENT, packet ){

		let slot = Number( packet.slot )

		if( slot === 2 || slot === 3 ){

			let item = AGENT._INVENTORY[ AGENT.equipped[ slot ] ]

			if( !item ){
				if( slot == 2 ) item = AGENT.left_hand
				if( slot == 3 ) item = AGENT.right_hand
			}

			let entity_type = lib._enum.types[ packet.target.type ]

			if( !entity_type ) return false

			let target = this[ entity_type ][ packet.target.mud_id ]

			if( !target ){
				log('flag', 'no target found to attack', packet )
				if( AGENT.type === 'npc' )  AGENT.idle( this )
				return false
			}

			let dist = lib.get_dist( AGENT.ref.position, target.ref.position )

			let resolution = COMBAT.resolve({
				type: 'attack',
				attacker: AGENT, 
				item: item, 
				target: target, 
				dist: dist,
				zone: this
			})

			this.emit('combat_resolution', SOCKETS, [], resolution )
			// emit before delete !! ^^ vv

			if( resolution.status === 'dead' ){
				delete this[ entity_type ][ target.mud_id ]
			}
			if( resolution.loot && resolution.loot.length ){
				this.add_items( resolution.loot, target.ref.position )
			}

		}else{

			log('flag', 'unknown slot type')

		}

	}




	add_items( items_array, position ){

		const zone = this

		for( const item of items_array ){

			if( !zone._ITEMS[ item.mud_id ]){

				log('zone', 'add_items: ', lib.identify('name', item ), item.mud_id )

				zone._ITEMS[ item.mud_id ] = new ItemFactory( item )
				zone._ITEMS[ item.mud_id ].ref.position.set(
					position.x + ( -1 + Math.random() * 2 ) * 10,
					1,
					position.z + ( -1 + Math.random() * 2 ) * 10,
				)

				zone._TIMEOUTS.items[ item.mud_id ] = setTimeout(function(){
					if( zone && zone._ITEMS[ item.mud_id ] ){
						delete zone._ITEMS[ item.mud_id ]
						zone.emit( 'pong_items', SOCKETS, false, lib.publish( zone._ITEMS ) )
					}
				}, 1000 * 60 * 5 )

			}

		}

		zone.emit( 'pong_items', SOCKETS, false, lib.publish( zone._ITEMS ) )

	}





	emit( type, group, exclude, packet, origin ){

		if( typeof exclude === 'string' )  exclude = [ exclude ]

		if( !exclude ) exclude = []

		// for( const mud_id of Object.keys( group )){
		for( const mud_id of Object.keys( this._TOONS )){
			let new_packet = {}
			if( SOCKETS[ mud_id ]){
				if( !exclude.includes( mud_id ) ){
					if( type === 'move_pulse' || type === 'npc_move_pulse' ){
						for( const toon_id of Object.keys( packet )){
							if( packet[ toon_id ].position.distanceTo( this._TOONS[ mud_id ].ref.position ) < GLOBAL.RENDER_RANGE ){
								new_packet[ toon_id ] = packet[ toon_id ]
							}
						}
						SOCKETS[ mud_id ].send(JSON.stringify({
							type: type,
							data: new_packet
						}))
					}else{
						SOCKETS[ mud_id ].send(JSON.stringify({
							type: type,
							data: packet
						}))
					}
				}
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
			x: vector.x,
			y: vector.y,
			z: vector.z,
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

		const sql = 'SELECT * FROM structures WHERE zone_key=' + this._id 

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ) log('flag', 'structure looukp  err: ', error )
		for ( const structure of results ){
			let struct = new Structure( structure )
			this._STRUCTURES[ struct.mud_id ] = struct
		}

	}



	async read_npcs(){

		if( !this._id )  return false

		const pool = DB.getPool()

		const sql = 'SELECT * FROM npcs WHERE zone_key=' + this._id 

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ) log('flag', 'npc looukp  err: ', error )
		for ( const npc of results ){
			let n = new Npc( npc )
			await n.touch_inventory()
			await n.touch_equipped()
			this._NPCS[ n.mud_id ] = n
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

		if( !value_sets ) return true
		if( !this._id ) return false

		const pool = DB.getPool()

		for( let i = 0; i  < value_sets.length; i++ ){

			let set = value_sets[ i ]

			for( const key of Object.keys( set ) ){
				if( typeof( set[ key ] ) === 'string' ){
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

			const { error, results, fields } = await pool.queryPromise( sql ) // blorb massive await for loop ...

			if( error || !results ){
				if( error ){
					log('flag', 'sql err:', error.sqlMessage, error.sql )
					return false
				}else{
					throw new Error( 'no results: ' + sql )
				}
			}

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

		log('zone', 'closing: ', zone.mud_id )
		await zone.save()
		log('zone', 'closed: ', zone.mud_id )

		return true


	}

}










module.exports = Zone