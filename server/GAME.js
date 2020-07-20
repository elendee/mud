
const env = require('./.env.js')
const log = require('./log.js')
const lib = require('./lib.js')

const GLOBAL = require('./GLOBAL.js')

const User = require('./User.js')
const SOCKETS = require('./SOCKETS.js')
const ROUTER = require('./ROUTER.js')
const MAP = require('./MAP.js')

const WSS = require('./WSS.js')

const DB = require('./db.js')

const Toon = require('./agents/Toon.js')
const Zone = require('./Zone.js')

// const moment = require('moment')

function noop(){} // ping callback


class Game {

	constructor( init ){

		init = init || {}

		this.opening = false

		this.pulse = false
		this.client_sweep = false

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
				log('zone', 'no zones; game going offline')

			}

		}, GLOBAL.PULSES.GAME )


		game.client_sweep = setInterval( function(){

			let toon = {}
			let zone = {}

			for( const mud_id of Object.keys( SOCKETS )){

				toon = SOCKETS[ mud_id ].request.session.USER._TOON
		    	zone = game.ZONES[ toon._current_zone ]

			    if ( SOCKETS[ mud_id ].isAlive === false ){
			    	game.purge( toon )
			    	return false
			    }
			 
			    SOCKETS[ mud_id ].isAlive = false
			    SOCKETS[ mud_id ].ping( noop )

			}

		}, 30000)


	}




	async init_user( socket ){

		const pool = DB.getPool()

		let USER, TOON, x, z, zone, start_zone_id

		socket.request.session.USER = USER = new User( socket.request.session.USER )

		SOCKETS[ USER.mud_id ] = socket

		if( USER._id ){ // auth'd users

			// if( socket.request.session ){
			// 	log('flag', 'huzzah', socket.request.body.desired_avatar )
			// }else 
			
			if( typeof( USER.active_avatar ) !== 'string' ){ 

				log('flag', 'invalid active_avatar: ', USER.active_avatar )
				socket.send(JSON.stringify({ type: 'error', msg: 'cannot use anon avatars while logged in <a href="/">back</a>'}))
				return false

			}else{

				if( USER._TOON && USER._TOON.name === USER.active_avatar ){ // still have session avatar

					log('toon', 'returning existing avatar: ', USER._TOON._id )

					USER._TOON = TOON = new Toon( USER._TOON )

				}else{ // logged in but no session avatar

					const toon = await this.get_toon( 'name', socket.request.session.USER, socket.request.session.USER.active_avatar )

					if( toon ){

						log('toon', 'looked up avatar: ', toon )

						USER._TOON = TOON = new Toon( toon )

						// log('flag', 'how what why' , USER._TOON._created, USER._TOON.created  )
					
					}else{ // logged in but no toons

						// USER._TOON = TOON = 
						socket.send(JSON.stringify({ type: 'error', msg: 'failed to initialize user'}))
						return false

					}

				}

			}

		}else{ // non-auth'd users

			USER._TOON = TOON = new Toon( USER._TOON )
			TOON.starter_equip = true

		}

		TOON.mud_id = USER.mud_id // v. important, overwrite mud_id so they share

		await TOON.touch_inventory()

		// await TOON.touch_equipped()

		socket.request.session.save(function(){ }) // for the non-auth'd users, so they get same avatar

		if( TOON._camped_key ){

			const sql = 'SELECT * FROM `structures` WHERE id=? LIMIT 1'

			const values = [ TOON._camped_key ]

			const { error, results, fields } = await pool.queryPromise( sql, values )

			if( error ){
				log('flag', 'err toon init: ', error )
				return false
			}

			// if( !results || !results.length || !results[0].zone_key ){
			// 	log('flag', 'initializing uncamped toon')
			// 	x = z = 0
			// }else{
			// 	x = lib.tile_from_Xpos( results[0].x )
			// 	z = lib.tile_from_Zpos( results[0].z )
			// }
			start_zone_id = TOON._camped_key

		}else{ // placing an uncamped toon:

			TOON.ref.position.x = GLOBAL.TOON_START_POS + ( ( 2 * Math.floor( Math.random() * GLOBAL.START_RADIUS ) ) - GLOBAL.START_RADIUS )
			TOON.ref.position.y = 0
			TOON.ref.position.z = GLOBAL.TOON_START_POS + ( ( 2 * Math.floor( Math.random() * GLOBAL.START_RADIUS ) ) - GLOBAL.START_RADIUS )

			start_zone_id = env.STARTER_ZONE_ID

			// probably will be Zone 0, 0 forever, but just in case:
			// x = lib.tile_from_Xpos( TOON.ref.position.x ) + 11
			// z = lib.tile_from_Zpos( TOON.ref.position.z )

		}

		const layer = TOON._layer

		zone = await this.touch_zone( 'id', start_zone_id )

		if( zone ){

			ROUTER.bind_user( this, USER.mud_id )

			zone._TOONS[ USER.mud_id ] = TOON

			const user = SOCKETS[ USER.mud_id ].request.session.USER.publish()

			TOON._current_zone = zone.mud_id

			SOCKETS[ USER.mud_id ].send( JSON.stringify( {
				type: 'session_init',
				USER: user,
				TOON: TOON.publish('_INVENTORY', '_stats' ),
				ZONE: zone.publish(  ), // '_FLORA', '_STRUCTURES'
				map: MAP,
			}) )

		}else{

			SOCKETS[ USER.mud_id ].send( JSON.stringify( {
				type: 'error',
				msg: 'error initializing zone<br><a href="/">back to landing page</a>',
			}) )

		}

	}







	async touch_zone( lookup_type, id, x, z, layer, new_x, new_z, new_layer ){
		
		const pool = DB.getPool()

		let sql, values, zone

		if( lookup_type === 'id' ){

			for( const mud_id of Object.keys( this.ZONES )){
				if( this.ZONES[ mud_id ]._id === id ){
					return this.ZONES[ mud_id ]
				}
			}

			sql = 'SELECT * FROM `zones` WHERE id=? LIMIT 1'

			values = [ id ]


		}else if( lookup_type === 'coords' ){

			if( typeof( x ) !== 'number' || typeof( z ) !== 'number' || typeof( layer ) !== 'number' ) return false

			let string_id = lib.zone_id( x, z, layer )

			if( this.ZONES[ string_id ] )  return this.ZONES[ string_id ]

			sql = 'SELECT * FROM `zones` WHERE x=? AND z=? AND layer=? LIMIT 1'

			values = [x, z, layer]

		}

		const { error, results, fields } = await pool.queryPromise( sql, values )

		if( results && results[0] ){ // read

			zone = new Zone( results[0] )

			await zone.bring_online()

		}else{ // create

			if( !new_x || !new_z || !new_layer ){
				log('flag', 'new zone requested without coords: ', lookup_type, id, x, z, layer )
				return false
			}

			zone = new Zone({
				_x: new_x,
				_z: new_z,
				_layer: new_layer
			})

			// log('flag', 'why invalid: ', zone._x, zone._z, zone._layer, x, z, layer )

			await zone.bring_online()

			const res = await zone.save()

		}

		log('zone', 'touched zone: ', zone._id )

		this.ZONES[ zone.mud_id ] = zone

		// let keys = []
		// for( const key of Object.keys( this.ZONES[ zone.mud_id ]._FLORA ) ){
		// 	keys.push[ key ]
		// }
		// log('flag', 'returning new keys -- ' , Object.keys( this.ZONES[ zone.mud_id ]._FLORA ) )

		return zone

	}




	async get_toon( type, user, identifier ){

		if( !identifier ){
			log('flag', 'invalid get_toon id: ', identifier )
			return false
		}

		const pool = DB.getPool()

		let toon_sql

		switch( type ){

			case 'name':
				toon_sql = 'SELECT * FROM avatars WHERE user_key=' + user._id + ' AND name="' + identifier + '" LIMIT 1'
				break;

			case 'id':
				toon_sql = 'SELECT * FROM avatars WHERE id=' + identifier + ' LIMIT 1'
				break;

			default: 
				return false
		}

		const { error, results, fields } = await pool.queryPromise( toon_sql )
		if( error ){
			log('flag', 'err get_toon: ', error )
		}
		if( !results || !results.length ){
			log('flag', 'no avatar found for: ', identifier )
			return false
		}
		return results[0]

	}



	get_all_toons(){

		const toons = {}

		for( const mud_id of Object.keys( this.ZONES )){
			for( const toon_id of Object.keys( this.ZONES[ mud_id ]._TOONS )){
				toons[ toon_id ] = this.ZONES[ mud_id ]._TOONS[ toon_id ]
			}
		}

		return toons

	}




	handle_chat( packet, zone, toon_id ){

		if( typeof packet.chat !== 'string' || packet.chat.trim() === '' ){
			return false
		}

		if( packet.chat.match(/^\/.*/)){
			this.handle_command( packet, toon_id )
			return true
		}

		const toon = zone._TOONS[ toon_id ]

		if( Date.now() - zone._TOONS[ toon_id ]._last_chat < 1000 ){
			toon._rapid_chats++
			if( toon._rapid_chats > 100 ){
				this.purge( toon )
			}else{
				SOCKETS[ toon_id ].send(JSON.stringify({
					type: 'error',
					msg: 'wait a little longer between chats',
					time: 2000
				}))
			}
			return false
		}
		toon._rapid_chats = 0
		toon._last_chat = Date.now()

		let group

		log('chat', 'packet: \n', packet )

		if( packet.method === 'whisper' ){
			packet.chat = packet.chat.replace(/^whisper: ?/, '')
		}else if( packet.method === 'yell' ){
			packet.chat = packet.chat.replace(/^yell: ?/, '')
		}else if( packet.method === 'say' ){
			packet.chat = packet.chat.replace(/^say: ?/, '')
		}else if( packet.method === 'proprietor' ){
			packet.chat = packet.chat.replace(/^to proprietor: ?/, '')
		}else if( packet.method === 'emote' ){
			packet.chat = packet.chat.replace(/^emote: ?/, '')
		}


		if( packet.method === 'proprietor' && toon.inside ){

			const proprietor = zone.get_proprietor( toon.inside )

			if( proprietor )  proprietor.respond( SOCKETS, toon, packet )

		}else{ // standard chats

			if( packet.method === 'yell' ){
				if( Date.now() - toon._last_yell < 1000 * 30 ){ 
					SOCKETS[ toon_id ].send(JSON.stringify({
						type: 'error',
						msg: 'your lungs are still tired from yelling',
						time: 2000
					}))
					return false
				}else{
					toon._last_yell = Date.now()
				}
			}

			if( toon.inside ){
				group = zone.get_toons( 'structure', { inside: toon.inside } )
			}else{
				group = zone.get_toons( 'chat', { position: toon.ref.position }, packet.method )
			}

			let the_chat = lib.sanitize_chat( packet.chat )
			if( packet.method === 'emote' ) the_chat = toon.name + ' ' + the_chat

			for( const mud_id of Object.keys( group ) ){ // normal range chats
				let chat_pack = {
					type: 'chat',
					data: {
						method: packet.method,
						sender_mud_id: toon_id,
						speaker: toon.name,
						chat: the_chat,
						color: toon.primary_color
					}
				}
				log('chat', chat_pack.speaker, chat_pack.chat )
				SOCKETS[ mud_id ].send(JSON.stringify( chat_pack ))
			}

			if( toon.inside && Object.keys( group ).length <= 1 ){ // alone with proprietor
				const structure = zone._STRUCTURES[ toon.inside ]
				if( structure ){
					structure.proprietor.respond( SOCKETS, toon, packet, true )
				}
			}

			if( !toon.inside && packet.method === 'say' ){ // mumble range chats

				let mumble_group = zone.get_toons( 'mumble_chat', { position: toon.ref.position } )

				for( const mud_id of Object.keys( mumble_group ) ){
					let chat_pack = {
						type: 'chat',
						data: {
							method: packet.method,
							sender_mud_id: toon_id,
							speaker: toon.name,
							// SOCKETS[ toon_id ].request.session.USER._TOON.name,
							chat: lib.mumble( lib.sanitize_chat( packet.chat ) ),
							color: toon.color
							// SOCKETS[ toon_id ].request.session.USER._TOON.color
						}
					}
					log('chat', chat_pack.speaker, chat_pack.chat )
					SOCKETS[ mud_id ].send(JSON.stringify( chat_pack ))
				}

			}

		}

	}



	purge( toon ){

		if( !toon ){
			log('flag', 'invalid purge: ', toon )
			return false
		}

		// close self
		SOCKETS[ toon.mud_id ].terminate()

		// close for ZONES (sweep all)
		for( const zone_id of Object.keys( this.ZONES )){
			for( const toon_id of Object.keys( this.ZONES[ zone_id ]._TOONS )){
				if( toon_id ===  toon.mud_id ){
					delete this.ZONES[ zone_id ]._TOONS[ toon_id ]
				}
			}
		}

		// close for SOCKETS
		if( SOCKETS[ toon.mud_id ] )  delete SOCKETS[ toon.mud_id ]

		log('connection', 'closed toon', toon.mud_id )

	}




	handle_command( packet, mud_id ){

		if( packet.chat.match(/^\/ts$/)){

			this.test_time( mud_id )
			.catch(err=>{
				log('flag', 'err test time: ', err )
			})

		}else{
			SOCKETS[ mud_id ].send( JSON.stringify({
				type: 'error',
				msg: 'unknown command',
				time: 3000
			}))
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