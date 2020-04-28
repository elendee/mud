const lib = require('./lib.js')
const log = require('./log.js')
const DB = require('./db.js')

const SOCKETS = require('./SOCKETS.js')

const MAP = require('./MAP.js')

const uuid = require('uuid').v4

module.exports = class Patron {
	
	constructor( init ){

		init = init || {}

		this._id = init._id

		this.mud_id = init.mud_id || uuid()

		this.email = init.email 

		this.ref = {
			position: {
				x: 0,
				y: 0,
				z: 0
			},
		}

		this._needs_pulse = true

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












	


	save( returnNewDocument ){ // same as update() but save all

		const patron = this

		const db = DB.getDB()

		if( !OID.isValid( patron._id ) )  patron._id = OID()

		return new Promise( (resolve, reject ) => {

			db.collection('users').replaceOne({
				_id: patron._id
			}, 
			patron, 
			{
				upsert: true,
				returnNewDocument: returnNewDocument
			}, function( err, result ){
				if( err || !result ){
					log('flag', 'failed to update patron', err )
					reject()
					return false
				}

				if( result.upsertedId ) patron._id = result.upsertedId._id // OID 

				if( result.ops[0] ){
					for( const key in result.ops[0]){
						patron[ key] = result.ops[0][ key ]
					}
					resolve( result.ops[0])
				}else{
					reject()
				}

				// seems this always need be http session
				// if( SOCKETS[ patron.mud_id ] ){
				// 	SOCKETS[ patron.mud_id ].request.session.save( function( err ){
				// 		if( err ){
				// 			log('err saving register attempt: ', err )
				// 			reject()
				// 		}
				// 		resolve( result.ops[0] )
				// 	})
				// }else{ 
				// 	log('flag', 'tried to save nonexistent socket: ', mud_id )
				// 	reject(0)
				// }

			})

		})	

	}

	

}









