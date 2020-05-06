// const lib = require('./lib.js')
const log = require('./log.js')
const DB = require('./db.js')

const SOCKETS = require('./SOCKETS.js')

const MAP = require('./MAP.js')

const Persistent = require('./Persistent.js')

const {
	Vector3
} = require('three')

const uuid = require('uuid').v4

module.exports = class User extends Persistent {
	
	constructor( init ){

		super( init )

		init = init || {}

		this._needs_pulse = true

		this.email = init.email 

		this.active_avatar = init.active_avatar

		this._TOON = init._TOON || init.TOON

	}


	async save(){

		const update_fields = [
			'name',
			'email',
			'active_avatar'
		]

		const update_vals = [ 
			this.name, 
			this.email,
			this.active_avatar
		]

		// if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
		// 	log('flag', 'cannot identify user for save: ', this._x, this._z, this._layer )
		// 	return false
		// }

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}
	


}









