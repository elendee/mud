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

				log('flag', Object.keys( game.ZONES ).length  + ' zones online')

				online = true

				if( !Object.keys( game.ZONES[ mud_id ].TOONS ).length ){
					game.ZONES[ mud_id ].close()
					delete game.ZONES[ mud_id ]
				}

			}

			if( !online ){

				clearInterval( game.pulse )
				game.pulse = false
				log('flag', 'no zones; game going offline')

			}

		}, GLOBAL.GAME_PULSE )

		

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

		let x, z

		const pool = DB.getPool()

		const { error, results, fields } = await pool.queryPromise( 'SELECT * FROM `structures` WHERE id=? LIMIT 1', [TOON.camped_key] )

		if( error ){
			log('flag', 'err toon init: ', error )
			return false
		}

		if( !results || !results.length || !results[0].zone_key ){
			log('flag', 'initializing uncamped toon')
			x = 0; z = 0
		}else{
			x = Math.floor( results[0].x )
			z = Math.floor( results[0].z )
		}

		// const x = Math.floor( TOON.ref.position.x )
		// const y = Math.floor( TOON.ref.position.y )
		// const z = Math.floor( TOON.ref.position.z )
		const altitude = TOON._altitude

		const zone = await this.touch_zone( x, z, altitude )

		if( !zone ){

			SOCKETS[ mud_id ].send( JSON.stringify( {
				type: 'error',
				msg: 'error initializing zone<br><a href="/">back to landing page</a>',
			}) )

		}else{

			ROUTER.bind_user( this, mud_id )

			zone.TOONS[ mud_id ] = TOON

			log('flag', '\n user mud_id: ', mud_id, '\n toon mud_id: ', TOON.mud_id )

			SOCKETS[ mud_id ].send( JSON.stringify( {
				type: 'session_init',
				USER: SOCKETS[ mud_id ].request.session.USER.publish(),
				ZONE: zone.publish(),
				map: MAP,
			}) )

		}

	}




	handle_chat( packet, mud_id ){

		if( packet.chat.match(/^\/.*/)){
			this.handle_command( packet, mud_id )
			return true
		}

		if( packet.chat == 'xyzzy'){
			SOCKETS[ mud_id ].send( JSON.stringify({
				type: 'zoom'
			}))
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




	async touch_zone( x, z, altitude ){

		if( typeof( x ) !== 'number' || typeof( z ) !== 'number' || typeof( altitude ) !== 'number' ) return false

		let string_id = x + '-' + z + '-' + altitude

		if( this.ZONES[ string_id ])  return this.ZONES[ string_id ]
		
		const pool = DB.getPool()

		const sql = 'SELECT * FROM `zones` WHERE x=? AND z=? AND altitude=? LIMIT 1'

		const { error, results, fields } = await pool.queryPromise( sql, [x, z, altitude])

		let zone 

		if( results && results[0] ){ // read

			zone = new Zone( results[0] )
			await zone.bring_online()

		}else{ // create

			zone = new Zone({
				_x: x,
				_z: z,
				_altitude: altitude
			})

			const res = await zone.save()
			if( !res ) return false

		}

		this.ZONES[ zone.mud_id ] = zone

		return zone

	}




}












let game = false

module.exports = (function(){
	if( game ) return game

	game = new Game()

	return game

})()