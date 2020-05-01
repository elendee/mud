const log = require('./log.js')
const lib = require('./lib.js')

const GLOBAL = require('./GLOBAL.js')

const User = require('./User.js')
const SOCKETS = require('./SOCKETS.js')
const ROUTER = require('./ROUTER.js')
const MAP = require('./MAP.js')

const DB = require('./db.js')

const Toon = require('./Toon.js')
const Zone = require('./Zone.js')

const moment = require('moment')


class Game {

	constructor( init ){

		init = init || {}

		this.opening = false

		this.pulse = false

		this.ZONES = init.ZONES || {}

	}



	async init_async_elements(){

		return true		

	}



	init_sync_elements(){

		const game = this

		game.pulse = setInterval(function(){

			let online = false

			for( const mud_id of Object.keys( game.ZONES ) ){

				log('pulses', Object.keys( game.ZONES ).length  + ' zones online')

				online = true

				if( !Object.keys( game.ZONES[ mud_id ]._TOONS ).length ){
					game.ZONES[ mud_id ].close()
					delete game.ZONES[ mud_id ]
				}

			}

			if( !online ){

				clearInterval( game.pulse )
				game.pulse = false
				log('flag', 'no zones; game going offline')

			}

		}, GLOBAL.PULSES.GAME )


	}




	async init_user( socket ){

		socket.request.session.USER = new User( socket.request.session.USER )
		// log('flag', 'user id: ', socket.request.session.USER.id )

		let mud_id = socket.request.session.USER.mud_id

		SOCKETS[ mud_id ] = socket

		if( socket.request.session.USER.id && !socket.request.session.USER.active_avatar ){
			socket.send( JSON.stringify({
				type: 'error',
				msg: 'no avatar found<br><a href="/">back to selection</a>'
			}))
			return false
		}

		let TOON 

		socket.request.session.USER.TOON = TOON = new Toon( socket.request.session.USER.TOON )
		TOON.mud_id = mud_id // v. important, overwrite mud_id so they share
		socket.request.session.save(function(){
			// log('flag','saved session.....')
		})

		let x, z

		if( TOON.camped_key ){

			const pool = DB.getPool()

			const sql = 'SELECT * FROM `structures` WHERE id=? LIMIT 1'

			const values = [ TOON.camped_key ]

			const { error, results, fields } = await pool.queryPromise( sql, values )

			if( error ){
				log('flag', 'err toon init: ', error )
				return false
			}

			if( !results || !results.length || !results[0].zone_key ){
				log('flag', 'initializing uncamped toon')
				x = z = 0
			}else{
				x = lib.tile_from_Xpos( results[0].x )
				z = lib.tile_from_Zpos( results[0].z )
			}

		}else{ // placing an uncamped toon:

			TOON.ref.position.x = GLOBAL.TOON_START_POS + ( ( 2 * Math.floor( Math.random() * GLOBAL.START_RADIUS ) ) - GLOBAL.START_RADIUS )
			TOON.ref.position.z = GLOBAL.TOON_START_POS + ( ( 2 * Math.floor( Math.random() * GLOBAL.START_RADIUS ) ) - GLOBAL.START_RADIUS )

			// probably will be Zone 0, 0 forever, but just in case:
			x = lib.tile_from_Xpos( TOON.ref.position.x ) + 11
			z = lib.tile_from_Zpos( TOON.ref.position.z )

		}

		const layer = TOON._layer

		const zone = await this.touch_zone( x, z, layer )

		if( zone ){

			ROUTER.bind_user( this, mud_id )

			zone._TOONS[ mud_id ] = TOON

			SOCKETS[ mud_id ].send( JSON.stringify( {
				type: 'session_init',
				USER: SOCKETS[ mud_id ].request.session.USER.publish(),
				ZONE: zone.publish( '_FOLIAGE' ),
				map: MAP,
			}) )

		}else{

			SOCKETS[ mud_id ].send( JSON.stringify( {
				type: 'error',
				msg: 'error initializing zone<br><a href="/">back to landing page</a>',
			}) )

		}

	}







	async touch_zone( x, z, layer ){

		if( typeof( x ) !== 'number' || typeof( z ) !== 'number' || typeof( layer ) !== 'number' ) return false

		let string_id = lib.zone_id( x, z, layer )

		if( this.ZONES[ string_id ] )  return this.ZONES[ string_id ]
		
		const pool = DB.getPool()

		const sql = 'SELECT * FROM `zones` WHERE x=? AND z=? AND layer=? LIMIT 1'

		const { error, results, fields } = await pool.queryPromise( sql, [x, z, layer])

		let zone 

		if( results && results[0] ){ // read

			zone = new Zone( results[0] )
			await zone.bring_online()

		}else{ // create

			zone = new Zone({
				_x: x,
				_z: z,
				_layer: layer
			})

			// log('flag', 'why invalid: ', zone._x, zone._z, zone._layer, x, z, layer )

			await zone.bring_online()

			const res = await zone.save()

		}

		this.ZONES[ zone.get_id() ] = zone

		return zone

	}





	handle_chat( packet, mud_id ){

		if( packet.chat.match(/^\/.*/)){
			this.handle_command( packet, mud_id )
			return true
		}

		if( packet.chat == 'xyzzy'){
			// SOCKETS[ mud_id ].send( JSON.stringify({
			// 	type: 'zoom'
			// }))
			return true
		}

		for( const socket_mud_id of Object.keys( SOCKETS )){
			let chat_pack = {
				type: 'chat',
				method: packet.method,
				sender_mud_id: mud_id,
				speaker: SOCKETS[ mud_id ].request.session.USER.TOON.name,
				chat: lib.sanitize_chat( packet.chat ),
				color: SOCKETS[ mud_id ].request.session.USER.TOON.color
			}
			log('chat', chat_pack.speaker, chat_pack.chat )
			SOCKETS[ socket_mud_id ].send(JSON.stringify( chat_pack ))
		}

	}




	handle_command( packet, mud_id ){

		if( packet.chat.match(/^\/ts$/)){

			this.test_time( mud_id )
			.catch(err=>{
				log('flag', 'err test time: ', err )
			})

		}else if( 1 ){
			// ........
		}

	}




	async test_time( mud_id ){

		////////////////////////////////////////////////////////////////////////
		log('flag', 'test_time disabled')
		return false
		////////////////////////////////////////////////////////////////////////

		const pool = DB.getPool()

		const sql = 'INSERT INTO test (server_stamp) VALUES ("' + moment().format('YYYY-MM-DD hh:mm:ss') + '")'
		// new Date().toISOString().split('.')[0]

		// log('flag', moment().format() )
		// log('flag', moment().format('YYYY-MM-DD hh:mm:ss') )
		// log('flag', new Date().toISOString().split('.')[0] ) //+"Z" )

		const { error, results, fields } = await pool.queryPromise( sql ) 

		if( error ){
			log('flag', 'test err', error )
			return false
		}

		log('commands', 'test results id: ', results.insertId )

		const retrieve = 'SELECT * FROM test WHERE id='+ results.insertId

		pool.query( retrieve, function( error, results, fields ){
			if( error ){
				log('flag', 'errorrrrr: ', error )
				return false
			}
			log('commands', 'and now res: ', results )

			// IITTT WOORRRKKSS

			// CREATED / EDITED / SERVER DATE ALL SAME POST-RETRIEVAL

		})

	}




}













let game = false

module.exports = (function(){
	if( game ) return game

	game = new Game()

	return game

})()