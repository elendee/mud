
const env = require('./.env.js')
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

// const moment = require('moment')


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

		const pool = DB.getPool()

		let USER, TOON, x, z, zone, start_zone_id

		socket.request.session.USER = USER = new User( socket.request.session.USER )

		SOCKETS[ USER.mud_id ] = socket

		if( USER._id ){ // auth'd users

			if( typeof( USER.active_avatar ) !== 'number' ){ 

				USER._TOON = TOON = false

			}else{

				if( USER._TOON && USER._TOON._id === USER.active_avatar ){ // still have session

					USER._TOON = new Toon( USER._TOON )

				}else{ // no session

					const toon = await this.get_toon( socket.request.session.USER.active_avatar )

					if( toon ){

						USER._TOON = TOON = new Toon( toon )
					
					}else{

						USER._TOON = TOON = false

					}

				}

			}

		}else{ // non-auth'd users

			USER._TOON = TOON = new Toon( USER._TOON )

		}

		TOON.mud_id = USER.mud_id // v. important, overwrite mud_id so they share

		await TOON.touch_inventory()

		await TOON.touch_equipped()

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
			TOON.ref.position.y = TOON.height / 2
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
				TOON: TOON.publish('_INVENTORY'),
				ZONE: zone.publish( '_FLORA', '_NPCS' ),
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

		this.ZONES[ zone.mud_id ] = zone

		return zone

	}




	async get_toon( _id ){

		if( !_id ){
			log('flag', 'invalid get_toon id: ', _id )
			return false
		}

		const pool = DB.getPool()

		const toon_sql = 'SELECT * FROM avatars WHERE id=' + _id + ' LIMIT 1'

		// return new Promise((resolve, reject)=>{

		// })

		const { error, results, fields } = await pool.query( toon_sql )
		if( error ){
			log('flag', 'err get_toon: ', error )
		}

		return results[0]

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
				speaker: SOCKETS[ mud_id ].request.session.USER._TOON.name,
				chat: lib.sanitize_chat( packet.chat ),
				color: SOCKETS[ mud_id ].request.session.USER._TOON.color
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