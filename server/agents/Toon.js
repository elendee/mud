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
		this._session = init._session || {
			inventory: false,
			equipped: false	
		}

		this.type = 'toon'

		this._table = 'avatars'

		this.icon_url = init.icon_url || 'toon'

		this._INVENTORY = init._INVENTORY

		this.surname = init.surname || 'O\'Toon'

		this.height = lib.validate_number( init.height, 3 )

		this.speed = env.TOON_SPEED || lib.validate_number( init.speed, 20 )

		let random_seed = Math.floor( Math.random() * 100 )
		this.color = init.color || lib.random_rgb( 
			[ random_seed, random_seed + 150], 
			[ random_seed, random_seed + 150], 
			[ random_seed, random_seed + 150] 
		)

		// this.portrait = init.portrait || lib.gen_portrait()
		
		this._name_attempted = init._name_attempted || Date.now() - 30000

		this._layer = typeof( init._layer ) === 'number' ? init._layer : 0

		this._camped_key = lib.validate_number( init._camped_key, init.camped_key, undefined )

		this._eqp = {
			hand_left: false,
			hand_right: false,
			waist_left: false,
			waist_right: false,
			back1: false,
			back2: false
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

		this.equipped = init.equipped 

		this.logistic = this.logistic || []
		this.logistic.push('equipped', 'right_hand', 'left_hand')
		// new Array(6)

	}


	async touch_inventory(){

		if( typeof( this._id ) === 'number' ){ // registered user

			log('toon', 'registered user login: ', this._id, lib.identify( 'name', this ))

			if( this._INVENTORY ){

				return true

			}else{

				const pool = DB.getPool()

				const sql = 'SELECT * FROM items WHERE owner_key=' + this._id

				const { error, results, fields } = await pool.queryPromise( sql )
				if( error ){
					log('flag', 'error retrieving inventory', error )
					return false
				}

				for( const item of results ){
					const this_item = new FACTORY( item )
					this._INVENTORY[ this_item.mud_id ] = this_item
				}

				return true

			}

		}else{  // unregistered

			log('toon', 'unregistered user login: ', this._id, lib.identify( 'name', this ))

			if( !this._INVENTORY || env.ETERNAL_NOOB ){

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

				}

			}else{

				log('toon', 'toon already has inventory')

			}

			return true

		}

	}



	async touch_equipped(){

		// log('flag', 'wot: ', this.equipped )
		// log('flag', 'wot: ', this._INVENTORY )

		// if( typeof( this._id ) === 'number' ){ // auth'd avatars

			// to use the session equip or the db equip ... ?

			// how to know if you HAVE session ?
		if( Array.isArray( this.equipped ) ){

			// return true

		}else{

			this.equipped = new Array(6)

			for( const mud_id of Object.keys( this._INVENTORY ) ){

				if( this._INVENTORY[ mud_id ]._id === this._eqp.hand_left ){

					log('flag', 'wott', 'ya' )
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

			for( const mud_id of Object.keys( this._INVENTORY ) ){

				if( this._INVENTORY[ mud_id ].name === 'Hatchet Launcher' ){
					this.equipped[ 2 ] =  mud_id 
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

			for( let i = 0; i < this.equipped.length; i++ ){
				if( this.equipped[ i ] && !this._INVENTORY[ this.equipped[ i ] ] ){
					log('toon', 'dropping: ', this.equipped )
					this.equipped[ i ] = undefined
					update_eqp = true
				}
			}

			update_inv = true

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
			SOCKETS[ this.mud_id ].send(JSON.stringify({
				type: 'inventory',
				inventory: this._INVENTORY
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

		if( !zone._ITEMS[ mud_id ] ){ log('flag', 'item is not in zone: ', mud_id, zone._ITEMS ); return false }
		if( this._INVENTORY[ mud_id ] ){ log('flag', 'toon already has item: ', mud_id ); return false }

		this._INVENTORY[ mud_id ] = zone._ITEMS[ mud_id ]
		delete zone._ITEMS[ mud_id ]

		// log('flag', 'WHY\n', this.publish_inventory() )
		// const keys = Object.keys( this._INVENTORY )
		// for( const key of keys ){
		// 	log('flag', Object.keys( this._INVENTORY[ key ] ))
		// }
		// log('flag', 'WHY\n',  this._INVENTORY )//publish_inventory() )
		SOCKETS[ this.mud_id ].request.session.save()

		SOCKETS[ this.mud_id ].send(JSON.stringify({
			type: 'acquire',
			inventory: this._INVENTORY,
			mud_id: mud_id
		}))

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
			type: 'melee'
		}).publish() ]

	}

	




	async save(){

		const update_fields = [
			'name',
			'height',
			'speed',
			'color',
			'layer',
			'vitality',
			'strength',
			'dexterity',
			'charisma',
			'perception',
			'luck',
			'intellect',
			'camped_key',
			'eqp_hand_left',
			'eqp_hand_right',
			'eqp_waist_left',
			'eqp_waist_left',
			'eqp_back1',
			'eqp_back2',
		]

		const update_vals = [ 
			this.name, 
			this.height,
			this.speed,
			this.color,
			this._layer,
			this._stats.vitality,
			this._stats.strength,
			this._stats.dexterity,
			this._stats.charisma,
			this._stats.perception,
			this._stats.luck,
			this._stats.intellect,
			this._camped_key,
			this._eqp.hand_left,
			this._eqp.hand_right,
			this._eqp.waist_left,
			this._eqp.waist_right,
			this._eqp.back1,
			this._eqp.back2,
		]

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}


}

