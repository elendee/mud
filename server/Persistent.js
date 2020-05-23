const lib = require('./lib.js')

const uuid = require('uuid').v4

module.exports = class Persistent {

	constructor( init ){

		init = init || {}

		this._id = init._id || init.id
		// lib.validate_number( init._id, init.id, undefined )

		this.mud_id = init.mud_id || uuid()

		this.type = init.type

		this.subtype = init.subtype

		this.icon_url = init.icon_url

		this.model_url = init.model_url

		this._table = init._table

		this._created = lib.validate_string( init._created, undefined )

		this._edited = lib.validate_string( init._edited, undefined )

		this.logistic = []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('logistic', 'mud_id', 'icon_url', 'model_url')

	}

	publish( ...excepted ){

		excepted = excepted || []

		let r = {}

		for( const key of Object.keys( this )){

			if( ( typeof( key ) === 'string' && key[0] !== '_' ) || excepted.includes( key ) ){
				if( this[ key ] && this[ key ].publish && typeof( this[ key ].publish ) === 'function' ){
					// r[ key ] = this[ key ].publish( ...excepted ) // on 2nd thought... do not pass exceptions beyond 1st scope...
					r[ key ] = this[ key ].publish()
				}else{
					r[ key ] = this[ key ]
				}
			}

		}

		return r

	}

}
