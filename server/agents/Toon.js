const env = require('../.env.js')
const DB = require('../db.js')
const lib = require('../lib.js')
const log = require('../log.js')
const {
	Vector3,
	Quaternion
} = require('three')

const AgentPersistent = require('./AgentPersistent.js')
const FACTORY = require('../items/FACTORY.js')
const Item = require('../items/Item.js')

const SOCKETS = require('../SOCKETS.js')

module.exports = class Toon extends AgentPersistent {

	constructor( init ){

		super( init )

		init = init || {}

		// needs hydrations.  not sure if needed yet..
		// this._session = init._session || {
		// 	inventory: false,
		// 	equipped: false	
		// }

		this.type = 'toon'

		this._table = 'avatars'

		this._user_key = lib.validate_number( init._user_key, init.user_key, 0 )

		this.icon_url = init.icon_url || 'toon'

		this._INVENTORY = init._INVENTORY

		// this.surname = init.surname || 'O\'Toon'
		this.surname = init.surname 

		this.race = lib.validate_string( init.race, 'human' )

		this.speed = Math.max( 20, lib.validate_number( 
			init.speed ? init.speed : undefined, 
			this._stats && this._stats.speed ? this._stats.speed : undefined, 
			20 
		))
		this.height = lib.validate_number( init._stats ? init._stats.height : undefined, init.height, 7 )

		// let random_seed = Math.floor( Math.random() * 100 )
		this.primary_color = lib.validate_string( init.primary_color, lib.random_rgb( [100, 255],[100, 255],[100, 255] ))
		this.secondary_color = lib.validate_string( init.secondary_color, lib.random_rgb( [ 0, 100],[ 0, 100],[ 0, 100] ))

		// this.portrait = init.portrait || lib.gen_portrait()
		
		this._name_attempted = init._name_attempted || Date.now() - 30000

		this._layer = lib.validate_number( this.layer, this._layer, 0 )

		this._camped_key = lib.validate_number( init._camped_key, init.camped_key, undefined )

		this._eqp = {
			hand_left: lib.validate_string( init.eqp_hand_left, undefined ),
			hand_right: lib.validate_string( init.eqp_hand_right, undefined ),
			waist_left: lib.validate_string( init.eqp_waist_left, undefined ),
			waist_right: lib.validate_string( init.eqp_waist_right, undefined ),
			back1: lib.validate_string( init.eqp_back1, undefined ),
			back2: lib.validate_string( init.eqp_back2, undefined ),
		}

		this.left_hand = init.left_hand || new Item({
			type: 'melee',
			name: 'left hand',
			range: 15
		})

		this.right_hand = init.right_hand || new Item({
			type: 'melee',
			name: 'right hand',
			range: 15
		})

		this.inside = init.inside

		this.equipped = init.equipped // || new Array(6)
		// this.equipped[0] = lib.validate_number( init.eqp_waist_left, undefined )
		// this.equipped[1] = lib.validate_number( init.eqp_back1, undefined )
		// this.equipped[2] = lib.validate_number( init.eqp_hand_left, undefined )
		// this.equipped[3] = lib.validate_number( init.eqp_hand_right, undefined )
		// this.equipped[4] = lib.validate_number( init.eqp_back2, undefined )
		// this.equipped[5] = lib.validate_number( init.eqp_waist_right, undefined )

		this._abiding = init._abiding 

		this._initialized_inventory = init.initialized_inventory

		this._last_yell = 0

		this.logistic = this.logistic || []
		this.logistic.push('equipped', 'right_hand', 'left_hand')
		// new Array(6)

	}








	async touch_inventory(){

		if( typeof( this._id ) === 'number' ){ // registered user

			log('toon', 'registered user login: ', this._id, lib.identify( 'name', this ))

			if( typeof this._INVENTORY === 'object' ){ // toon is already in memory

				this.touch_equipped()

				return true

			}else{ // standard retrieve

				this._INVENTORY = {}

				const pool = DB.getPool()

				const sql = 'SELECT * FROM items WHERE owner_key=' + this._id

				const { error, results, fields } = await pool.queryPromise( sql )
				if( error ){
					log('flag', 'error retrieving inventory', error )
					return false
				}

				if( !results.length ){ // toon no items

					log('toon', 'no items found for toon')

					if( !this.initialized_inventory ){ //  new toon fill

						log('toon', 'new toon inventory fill')
						
						const stick = new FACTORY({
							subtype: 'melee',
							name: 'Unwieldy Stick',
							power: 2,
							owner_key: this._id
						})
						this._INVENTORY[ stick.mud_id ] = stick

						const trousers = new FACTORY({
							subtype: 'armor',
							name: 'Unwieldy Trousers',
							owner_key: this._id,
							// icon_url: 'noun_trousers',
						})
						this._INVENTORY[ trousers.mud_id ] = trousers

						const belt = new FACTORY({
							subtype: 'armor',
							name: 'Unwieldy Vest',
							owner_key: this._id,
							// icon_url: 'noun_shirt',
						})
						this._INVENTORY[ belt.mud_id ] = belt

					}

				}else{ // standard fill

					log('toon', 'registered toon retrieved: ' + results.length + ' items for toon ' + this._id )

					for( const item of results ){
						const this_item = new FACTORY( item )
						this._INVENTORY[ this_item.mud_id ] = this_item
					}

				}

				this.touch_equipped()

			}

		}else{  // unregistered inventory fill

			log('toon', 'unregistered inventory fill: ', lib.identify( 'name', this ) )

			if( !this._INVENTORY ){ // 

				this._INVENTORY = {}

				const stick = new FACTORY({
					subtype: 'melee',
					name: 'Unwieldy Stick',
					// icon_url: 'noun_stick',
					power: 2
				})
				this._INVENTORY[ stick.mud_id ] = stick
				// log('flag', 'wots worng wit me stick', stick )
				const trousers = new FACTORY({
					subtype: 'armor',
					name: 'Unwieldy Trousers',
					// icon_url: 'noun_trousers',
				})
				this._INVENTORY[ trousers.mud_id ] = trousers
				const belt = new FACTORY({
					subtype: 'armor',
					name: 'Unwieldy Vest',
					// icon_url: 'noun_shirt',
				})
				this._INVENTORY[ belt.mud_id ] = belt

				if( env.DEV ){

					const megasword = new FACTORY({
						subtype: 'melee',
						name: 'Mega Sword',
						icon_url: 'short-sword',
						power: 50
					})
					this._INVENTORY[ megasword.mud_id ] = megasword
					const megastaff = new FACTORY({
						subtype: 'magic',
						name: 'Mega Staff',
						icon_url: 'scepter',
						power: 20
					})
					this._INVENTORY[ megastaff.mud_id ] = megastaff
					const megaarmor = new FACTORY({
						subtype: 'armor',
						name: 'Mega Armor',
						icon_url: 'cape',
						power: 50
					})
					this._INVENTORY[ megaarmor.mud_id ] = megaarmor
					const megabow = new FACTORY({
						subtype: 'ranged',
						name: 'Mega Bow',
						icon_url: 'bow',
						power: 10
					})
					this._INVENTORY[ megabow.mud_id ] = megabow
					const hatchet_launcher = new FACTORY({
						subtype: 'ranged',
						name: 'Hatchet Launcher',
						icon_url: 'bow',
						power: 500
					})
					this._INVENTORY[ hatchet_launcher.mud_id ] = hatchet_launcher

					this.touch_equipped()

					this.equipped[3] = hatchet_launcher.mud_id

				}

			}else{

				log('toon', 'toon already has inventory')

			}

			this.touch_equipped()	

		}

		if( env.DEV && !this.get_inventory('name', 'hatchet launcher', true ) ){ // dev adds

			const hatchet_launcher = new FACTORY({
				subtype: 'ranged',
				name: 'Hatchet Launcher',
				icon_url: 'bow',
				power: 500
			})
			this._INVENTORY[ hatchet_launcher.mud_id ] = hatchet_launcher

			this.equipped[ 2 ] = hatchet_launcher.mud_id 

		}

		return true

	}










	touch_equipped(){

		// log('flag', 'wot: ', this.equipped )
		// log('flag', 'wot: ', this._INVENTORY )
		// if( typeof( this._id ) === 'number' ){ // auth'd avatars
		// to use the session equip or the db equip ... ?
		// how to know if you HAVE session ?

		if( Array.isArray( this.equipped ) ){

			return true

		}else{

			this.equipped = new Array(6)

			for( const mud_id of Object.keys( this._INVENTORY ) ){

				if( this._INVENTORY[ mud_id ]._id === this._eqp.hand_left ){

					// log('flag', 'wott', 'ya' )
					this.equipped[0] = this._INVENTORY[ mud_id ]

				}else if( this._INVENTORY[ mud_id ]._id === this._eqp.hand_right ){

					this.equipped[1] = this._INVENTORY[ mud_id ]

				}else if( this._INVENTORY[ mud_id ]._id === this._eqp.waist_left ){

					this.equipped[2] = this._INVENTORY[ mud_id ]

				}else if( this._INVENTORY[ mud_id ]._id === this._eqp.waist_right ){

					this.equipped[3] = this._INVENTORY[ mud_id ]

				}else if( this._INVENTORY[ mud_id ]._id === this._eqp.back1 ){

					this.equipped[4] = this._INVENTORY[ mud_id ]

				}else if( this._INVENTORY[ mud_id ]._id === this._eqp.back2 ){

					this.equipped[5] = this._INVENTORY[ mud_id ]

				}

			}

		}
		
		return this.equipped

	}










	equip( held, slot ){

		log('toon', 'eqp: ', held, slot )

		//////////////// init vars:

		let held_id = held ? held.mud_id : false
		// let mud_id = 
		let origin_type = held ? held.origin : false
		let destination = Number( slot )

		if( !slot || !held_id || !origin_type ){
			log('flag', 'invalid equip req: ', held, slot )
			return false
		}

		if( !this._INVENTORY[ held_id ] ){
			log('flag', 'do not possess requested eqp item: ', held.mud_id )
			return false 
		}

		let origin_slot
		for(let i = 0; i < this.equipped.length; i++){
			if( this.equipped[ i ] === held_id ){
				origin_slot = i
				continue
			}
		}

		//////////////// now equip:

		if( !this.equipped[ destination ] ){ // simple equip

			for(let i = 0; i < this.equipped.length; i++){
				if( this.equipped[ i ] === held_id )  this.equipped[ i ] = false
			}

			this.equipped[ destination ] = held_id

		}else if( this.equipped[ destination ] === held_id ){ // redundant, should be blocked on client

			log('toon', 'redundant equip')

		}else if( this.equipped[ destination ] ){ 

			if( origin_type === 'action_bar' ){ // swap

				
				if( origin_slot ){
					this.equipped[ origin_slot ] = this.equipped[ destination ]
					this.equipped[ destination ] = held_id
				}

			}else{ // replace from inventory

				this.equipped[ destination ] = held_id

			}

		}else{
			log('flag', 'unhandled equip req: ', held, slot )
		}

		SOCKETS[ this.mud_id ].send(JSON.stringify({
			type: 'equip',
			equipment: this.equipped
		}))
		SOCKETS[ this.mud_id ].request.session.save()

	}








	drop( held ){

		let update_eqp = false
		let update_inv = false

		if( held.origin === 'inventory' ){

			delete this._INVENTORY[ held.mud_id ]
			update_inv = true
			
			for( let i = 0; i < this.equipped.length; i++ ){
				if( this.equipped[ i ] && !this._INVENTORY[ this.equipped[ i ] ] ){ // drop any equipped not in _INVENTORY
					log('toon', 'dropping: ', this.equipped )
					this.equipped[ i ] = undefined
					update_eqp = true
				}
			}

		}else if( held.origin === 'action_bar' ){

			let drop 
			for( let i = 0; i < this.equipped.length; i++ ){
				if( this.equipped[ i ] === held.mud_id )  drop = i
			}

			if( typeof( drop ) === 'number' ){

				this.equipped[ drop ] = undefined

				update_eqp = true

			}else{
				log('flag', 'could not find equipped item to drop: ', held.mud_id )
			}

		}else{
			log('flag', 'unknown drop origin', held )
		}

		if( update_inv ){
			SOCKETS[ this.mud_id ].send( JSON.stringify({
				type: 'set_inventory',
				data: this._INVENTORY
			}))
		}
		if( update_eqp ){
			SOCKETS[ this.mud_id ].send(JSON.stringify({
				type: 'equip',
				equipment: this.equipped
			}))
		}
		if( update_eqp || update_inv )  SOCKETS[ this.mud_id ].request.session.save()
	
	}









	acquire( zone, mud_id ){

		if( !zone._ITEMS[ mud_id ] ){ 
			log('flag', 'item is not in zone: ', mud_id, Object.keys( zone._ITEMS ) )
			return false 
		}
		if( this._INVENTORY[ mud_id ] ){ 
			log('flag', 'toon already has item: ', mud_id )
			return false 
		}

		const item = zone._ITEMS[ mud_id ]

		if( typeof this._id !== 'number' ){
			SOCKETS[ this.mud_id ].send(JSON.stringify({
				type: 'error',
				msg: 'anonymous toons may not acquire items'
			}))
			return false
		}

		item.zone_key = false
		item.npc_key = false
		item.owner_key = this._id 

		item.save().catch( err => { log('flag', 'err saving item', err ) })

		// const pool = DB.getPool()
		// let sql = 'UPDATE items SET owner_key=' + this._id + ', zone_key=NULL, npc_key=NULL WHERE id=' + item._id

		// if( typeof item._id === 'number' ){ // update

		// 	sql = 'UPDATE items SET owner_key=' + this._id + ', zone_key=NULL, npc_key=NULL WHERE id=' + item._id

		// }else{ // create

		// 	sql = 'INSERT INTO items  '

		// }

		// pool.query(sql, (error, results, fields)=>{
		// 	if( error || !results ){
		// 		log('flag', 'error toon acquire', err )
		// 		return false
		// 	}
		// 	log('toon', 'update item success')
		// })

		// blorb
		// also save inventory .......

		this._INVENTORY[ mud_id ] = item
		delete zone._ITEMS[ mud_id ]

		SOCKETS[ this.mud_id ].request.session.save()

		// emit acquisition (for all other toons)
		zone.emit('zone_remove_item', SOCKETS, [], { mud_id: mud_id } )

		// emit acquisition (to new owner)
		SOCKETS[ this.mud_id ].send( JSON.stringify({
			type: 'set_inventory',
			data: this._INVENTORY,
			// mud_id: mud_id
		}))

		

	}









	get_inventory( type, data, once ){

		const r = {}

		switch( type ){
			case 'name':
				const regex = new RegExp( data, 'i' )
				for( const mud_id of Object.keys( this._INVENTORY )){
					if( this._INVENTORY[ mud_id ].name && this._INVENTORY[ mud_id ].name.match( regex ) ){
						// log('flag', 'MATCH: ', this._INVENTORY[ mud_id ].name )
						if( once ){
							return this._INVENTORY[ mud_id ]
						}else{
							r[ mud_id ] = this._INVENTORY[ mud_id ].name
						}
					}
				}
				break;
			default: break;
		}

		if( Object.keys( r ).length ){
			return r
		}else{
			return false
		}

	}




	// publish_inventory(){
	// 	const inv = {}
	// 	for( const mud_id of Object.keys( this._INVENTORY )){
	// 		inv[ mud_id ] = {} //this._INVENTORY[ mud_id ]
	// 		for( const key of Object.keys( this._INVENTORY[ mud_id ] )){
	// 			if( key !== '_timeout' ) inv[ mud_id ][ key ] = this._INVENTORY[ mud_id ][ key ]
	// 		}
	// 	}
	// 	return inv
	// }






	drop_loot( zone ){

		log('flag', 'skipping toon drop items...')

		return [ new Item({
			subtype: 'melee'
		}).publish() ]

	}






	attempt_entry( zone, mud_id ){

		const structure = zone._STRUCTURES[ mud_id ]

		const toon = this

		if( !structure ){
			SOCKETS[ this.mud_id ].send(JSON.stringify({
				type: 'entry',
				data: {
					success: false,
					msg: 'no structure found'
				}
			}))
			return false
		}

		// log('flag', 'attempting entry: ', zone._STRUCTURES[ mud_id ] )

		if( structure._private ){
			if( structure.owner !== this.mud_id ){
				SOCKETS[ this.mud_id ].send(JSON.stringify({
					type: 'entry',
					data: {
						success: false,
						msg: 'this structure is locked'
					}
				}))
				return false
			}
		}

		zone._STRUCTURES[ mud_id ]._residents[ this.mud_id ] = this

		this.inside = mud_id

		// SOCKETS[ this.mud_id ].send(JSON.stringify({
		// 	type: 'entry',
		// 	success: true,
		// 	mud_id: mud_id
		// }))

		setTimeout(()=>{
			
			zone.emit('entry', SOCKETS, [], {
				toon_id: toon.mud_id,
				structure_id: mud_id,
				success: true
			})		

			zone._STRUCTURES[ mud_id ].proprietor.greet( SOCKETS, this )

		}, 1000 )

		// emit( type, group, exclude, packet ){
		// if( typeof exclude === 'string' )  exclude = [ exclude ]

		this._abiding = mud_id

	}






	exit_structure( zone, structure_id ){
		this.inside = false
	}

	




	async save(){

		const update_fields = [
			'name',
			'race',
			'primary_color',
			'secondary_color',
			'layer',
			'vitality',
			'strength',
			'dexterity',
			'perception',
			'luck',
			'intellect',
			'speed',
			'height',
			'user_key',
			'camped_key',
			'eqp_hand_left',
			'eqp_hand_right',
			'eqp_waist_left',
			'eqp_waist_right',
			'eqp_back1',
			'eqp_back2',
		]

		const update_vals = [ 
			this.name, 
			this.race,
			this.primary_color,
			this.secondary_color,
			this._layer,
			this._stats.vitality,
			this._stats.strength,
			this._stats.dexterity,
			this._stats.perception,
			this._stats.luck,
			this._stats.intellect,
			this._stats.speed,
			this._stats.height,
			this._user_key,
			this._camped_key,
			this.equipped[2],
			this.equipped[3],
			this.equipped[0],
			this.equipped[1],
			this.equipped[4],
			this.equipped[5],
			// this._eqp.hand_left,
			// this._eqp.hand_right,
			// this._eqp.waist_left,
			// this._eqp.waist_right,
			// this._eqp.back1,
			// this._eqp.back2,
		]

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}


}

