
const Persistent = require('./Persistent.js')
const uuid = require('uuid').v4
const lib = require('./lib.js')
const {
	Vector3,
	Quaternion
} = require('three')

module.exports = class Toon extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'avatars'

		this.name = init.name || 'Toon_' + lib.random_hex( 4 )

		this.height = 3

		this.speed = 10

		this.color = init.color || lib.random_rgb(100, 255)

		// this.portrait = init.portrait || lib.gen_portrait()
		
		this.name_attempted = init.name_attempted || Date.now() - 30000

		this._altitude = init._altitude || 1

		this.ref = init.ref || {}

		this.ref.position = this.ref.position || new Vector3()
		
		this.ref.quaternion = this.ref.quaternion || new Quaternion()

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