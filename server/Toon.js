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

	}


	async fill_inventory(){

		if( typeof( this._id ) === 'number' ){

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

		}else{

			const stick = new FACTORY({
				type: 'melee',
				name: 'Unwieldy Stick'
			})
			if( stick ){
				this._INVENTORY[ stick.mud_id ] = stick
			}

			return true

		}

	}


	// publish(){

	// 	let r = {}

	// 	for( const key of Object.keys( this )){

	// 		if( typeof( key ) === 'string' && key[0] !== '_' ){
	// 			if( this[ key ] && this[ key ].publish && typeof( this[ key ].publish ) === 'function' ){
	// 				r[ key ] = this[ key ].publish()
	// 			}else{
	// 				r[ key ] = this[ key ]
	// 			}
	// 		}

	// 	}

	// 	return r

	// }

}