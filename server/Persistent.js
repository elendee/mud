const uuid = require('uuid').v4

module.exports = class Persistent {

	constructor( init ){

		init = init || {}

		this._id = init._id || init.id

		this.mud_id = init.mud_id || uuid()

		this._table = init._table

		this._created = init._created

	}

	publish(){

		let r = {}

		for( const key of Object.keys( this )){

			if( typeof( key ) === 'string' && key[0] !== '_' ){
				if( this[ key ] && this[ key ].publish && typeof( this[ key ].publish ) === 'function' ){
					r[ key ] = this[ key ].publish()
				}else{
					r[ key ] = this[ key ]
				}
			}

		}

		return r

	}

}
