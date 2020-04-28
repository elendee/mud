const uuid = require('uuid').v4

module.exports = class Toon {

	constructor( init ){

		init = init || {}

		this._id = init._id

		this.mud_id = init.mud_id || uuid()

		this.name = init.name || 'Patron_' + lib.random_hex( 4 )

		this.height = 3

		this.color = init.color || lib.random_rgb(100, 255)

		this.portrait = init.portrait || lib.gen_portrait()
		
		this.name_attempted = init.name_attempted || Date.now() - 30000



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