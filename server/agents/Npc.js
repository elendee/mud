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

const objective_enum = {
	'travel': 'travel', 
	'attack': 'attack',
	'wait': 'wait'
}

let remaining_dist

class Objective{

	constructor( init ){

		init = init || {}
		this.type = objective_enum[ init.type ]
		this.destination = lib.validate_vec3( init.destination, new Vector3(500, 0, 500) )
		this.target = init.target
		this.count = init.count

	}

}



module.exports = class Toon extends AgentPersistent {

	constructor( init ){

		super( init )

		init = init || {}

		// needs hydrations.  not sure if needed yet..
		this._session = init._session || {
			inventory: false,
			equipped: false	
		}

		this.type = 'npc'

		this._table = 'npcs'

		this.icon_url = init.icon_url || 'npc'

		this._INVENTORY = init._INVENTORY || {}

		// this.surname = init.surname || 'O\'Toon'
		this.surname = init.surname 

		this.height = lib.validate_number( init.height, 3 )

		this.speed = lib.validate_number( 
			env.SPEEDUP ? 100 : undefined, 
			init.speed, 
			this._stats ? this._stats.speed : undefined, 
			20 
		)

		let random_seed = Math.floor( Math.random() * 100 )

		this.color = init.color || lib.random_rgb( 
			[ random_seed, random_seed + 150], 
			[ random_seed, random_seed + 150], 
			[ random_seed, random_seed + 150] 
		)

		this._name_attempted = init._name_attempted || Date.now() - 30000

		this._layer = typeof( init._layer ) === 'number' ? init._layer : 0

		this._zone_key = lib.validate_number( init._zone_key, init.zone_key, undefined )

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

		this.starter_equip = init.starter_equip || false

		this.inside = init.inside

		this.equipped = init.equipped 

		this._abiding = init._abiding 

		this.logistic = this.logistic || []
		this.logistic.push('equipped', 'right_hand', 'left_hand')

	}


	async touch_inventory(){

		if( typeof( this._id ) === 'number' ){ // from Toon.. should always be true here

			if( typeof this._INVENTORY === 'object' ){

				return true

			}else{

				const pool = DB.getPool()

				const sql = 'SELECT * FROM items WHERE npc_key=' + this._id

				const { error, results, fields } = await pool.queryPromise( sql )
				if( error ){
					log('flag', 'error retrieving inventory', error )
					return false
				}

				for( const item of results ){
					const this_item = new FACTORY( item )
					this._INVENTORY[ this_item.mud_id ] = this_item
				}

				if( !results.length ){
					const stick = new FACTORY({
						subtype: 'melee',
						name: 'Unwieldy Stick',
						power: 2
					})
					this._INVENTORY[ stick.mud_id ] = stick
				}

				return true

			}

		}else{  // unregistered

			log('flag', 'npc has no id ?')



		}

	}



	async touch_equipped(){

		if( Array.isArray( this.equipped ) ){

			// return true

		}else{

			this.equipped = new Array(6)

			for( const mud_id of Object.keys( this._INVENTORY ) ){

				if( this._INVENTORY[ mud_id ]._id === this._eqp.hand_left ){

					// log('flag', 'ya' )
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



	assign_objective(){

		if( Math.random() < .2 ){

			// log('flag', 'new dest')

			let new_x = Math.floor( Math.random() * 1000 )
			let new_z = Math.floor( Math.random() * 1000 )
			if( Math.random() > .5 )  new_x *= -1
			if( Math.random() > .5 )  new_z *= -1
			if( new_x < 0 ) new_x = Math.abs( new_x )
			if( new_x > 1000 ) new_x = new_x - 1000 
			if( new_z < 0 ) new_z = Math.abs( new_z )
			if( new_z > 1000 ) new_z = new_z - 1000 

			this._objective = new Objective({
				type: 'travel',
				destination: new Vector3( new_x, 0, new_z )
			})

			// throw new Error(0)

		}else{

			// log('flag', 'new wait')

			this._objective = new Objective({
				type: 'wait',
				count: Math.floor( Math.random() * 10 )
			})

		}

	}



	move(){

		if( this._objective.type === 'travel' ){

			// log('flag', 'travel')

			if( !this._objective.destination ) return false

			this._scratch.facing.subVectors( this._objective.destination, this.ref.position ).normalize()
			const projection = new Vector3().copy( this._scratch.facing ).multiplyScalar( this.speed )
			this._scratch.projection.copy( this.ref.position ).add( projection )

			remaining_dist = this._objective.destination.distanceTo( this.ref.position )
			// log('flag', 'r: ', remaining_dist)

			if( this._scratch.projection.distanceTo( this.ref.position ) >  remaining_dist ){
				this.ref.position.copy( this._objective.destination )
				this._objective = false

			}else{
				this.ref.position.copy( this._scratch.projection )
			}

		}else if( this._objective.type === 'attack' ){

			// log('flag', 'attack')

			if( !this._objective.target ) return false

			this._scratch.facing.subVectors( this._objective.target.ref.position, this.ref.position ).normalize()
			this._scratch.projection.copy( this._scratch.facing ).multiplyScalar( this.speed )

			if( this._scratch.projection.distanceTo( this.ref.position ) > this._objective.destination.distanceTo( this.ref.position )){
				this.ref.position = this._objective.destination
				this._objective = false
			}else{
				this.ref.position.add( this._scratch.projection )
			}

		}else if( this._objective.type === 'wait' ){

			// log('flag', 'wait')

			this._objective.count--
			if( this._objective.count <= 0 ) this.assign_objective()

		}

	}




	drop_loot( zone ){

		log('flag', 'skipping npc drop items...')

		return [ new Item({
			subtype: 'melee'
		}).publish() ]

	}









	async save(){

		const update_fields = [
			'name',
			'height',
			// 'speed',
			'color',
			'layer',
			'vitality',
			'strength',
			'dexterity',
			'charisma',
			'perception',
			'luck',
			'intellect',
			'speed',
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
			// this.speed,
			this.color,
			this._layer,
			this._stats.vitality,
			this._stats.strength,
			this._stats.dexterity,
			this._stats.charisma,
			this._stats.perception,
			this._stats.luck,
			this._stats.intellect,
			this._stats.speed,
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

