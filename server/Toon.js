const env = require('./.env.js')
const DB = require('./db.js')
const lib = require('./lib.js')
const log = require('./log.js')
const {
	Vector3,
	Quaternion
} = require('three')

const Persistent = require('./Persistent.js')
const FACTORY = require('./items/FACTORY.js')

module.exports = class Toon extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'avatars'

		this._INVENTORY = init._INVENTORY || {}

		this.name = init.name || 'Toon_' + lib.random_hex( 4 )

		this.height = 3

		this.speed = env.TOON_SPEED || 20

		this.color = init.color || lib.random_rgb(100, 255)

		// this.portrait = init.portrait || lib.gen_portrait()
		
		this.name_attempted = init.name_attempted || Date.now() - 30000

		this._layer = typeof( init._layer ) === 'number' ? init._layer : 0

		this.ref = init.ref || {}

		this.ref.position = this.ref.position || new Vector3()
		
		this.ref.quaternion = this.ref.quaternion || new Quaternion()

		this._eqp = {
			hand_left: false,
			hand_right: false,
			waist_left: false,
			waist_right: false,
			back1: false,
			back2: false
		}

		this.equipped = new Array(6)

	}


	async fill_inventory(){

		if( typeof( this._id ) === 'number' ){ // registered user

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

		}else{  // unregistered

			const stick = new FACTORY({
				type: 'melee',
				name: 'Unwieldy Stick',
				icon_url: 'noun_stick.png'
			})
			if( stick ){
				this._INVENTORY[ stick.mud_id ] = stick
			}
			const trousers = new FACTORY({
				type: 'melee',
				name: 'Unwieldy Trousers',
				icon_url: 'noun_trousers.png'
			})
			if( trousers ){
				this._INVENTORY[ trousers.mud_id ] = trousers
			}

			return true

		}

	}



	equip(){
		for( const mud_id of Object.keys( this._INVENTORY ) ){
			if( this._INVENTORY[ mud_id ]._id === this._eqp.hand_left ){
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



	async save(){

		const update_fields = [
			'name',
			'height',
			'speed',
			'color',
			'layer',
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
			this._eqp.hand_left,
			this._eqp.hand_right,
			this._eqp.waist_left,
			this._eqp.waist_right,
			this._eqp.back1,
			this._eqp.back2,
		]

		// if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
		// 	log('flag', 'cannot identify user for save: ', this._x, this._z, this._layer )
		// 	return false
		// }

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}


}

