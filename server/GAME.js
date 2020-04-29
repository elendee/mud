const log = require('./log.js')

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

		socket.request.session.USER.TOON = new Toon( socket.request.session.USER.TOON )

		const x = Math.floor( socket.request.session.USER.TOON.ref.position.x )
		// const y = Math.floor( socket.request.session.USER.TOON.ref.position.y )
		const z = Math.floor( socket.request.session.USER.TOON.ref.position.z )
		const altitude = socket.request.session.USER.TOON._altitude

		const zone = await this.touch_zone( x, z, altitude )

		if( !zone ){
			log('flag', 'init_user fail')
			return false
		}

		ROUTER.bind_user( this, mud_id )

		SOCKETS[ mud_id ].send( JSON.stringify( {
			type: 'session_init',
			USER: SOCKETS[ mud_id ].request.session.USER.publish(),
			ZONE: zone.publish(),
			map: MAP
		}) )

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
				speaker: SOCKETS[ mud_id ].request.session.PATRON.name,
				chat: lib.sanitize_chat( packet.chat ),
				color: SOCKETS[ mud_id ].request.session.PATRON.color
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

			await zone.save()

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