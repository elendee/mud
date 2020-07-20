const log = require('./log.js')
const env = require('./.env.js')
const lib = require('./lib.js')
const SOCKETS = require('./SOCKETS.js')
const MAP = require('./MAP.js')
// const PILLARS = require('./PILLARS.js')

// const EMIT = require('./EMIT.js')

const auth = require('./auth.js')

const { Vector3, Quaternion } = require('three')

// const TREES = require('./TREES.js')
// const BOTS = require('./BOTS.js')

let loc_type, loc_id, LOCATION

module.exports = {

	bind_user: function( GAME, mud_id ){

		let packet = {}

		SOCKETS[ mud_id ].on('message', function( data ){

			try{ 
				packet = lib.sanitize_packet( JSON.parse( data ) )
			}catch(e){
				SOCKETS[ mud_id ].request.session.bad_packets++
				if( SOCKETS[ mud_id ].request.session.bad_packets > 100 ){
					log('flag', 'packet problem for USER:', mud_id, e )
				}
			}

			const TOON = SOCKETS[ mud_id ].request.session.USER._TOON

			let zone, toon

			switch( packet.type ){

				case 'user_ping':

					if( SOCKETS[ packet.mud_id ]){
						SOCKETS[ mud_id ].send(JSON.stringify({
							type: 'user_pong',
							user: TOON.publish()
						}))
					}

					break;

				case 'toon_ping':
					// find toon's zone:
					for( const zone_id of Object.keys( GAME.ZONES )){
						for( const toon_id of Object.keys( GAME.ZONES[ zone_id ]._TOONS )){
							if( toon_id === packet.mud_id ){
								zone = GAME.ZONES[ zone_id ]
							}
						}
					}
					SOCKETS[ mud_id ].send(JSON.stringify({
						type: 'toon_pong',
						data: zone._TOONS[ packet.mud_id ].publish()
					}))
					break;

				case 'npc_ping':
					// find toon's zone:
					for( const zone_id of Object.keys( GAME.ZONES )){
						for( const mud_id of Object.keys( GAME.ZONES[ zone_id ]._NPCS )){
							if( mud_id === packet.mud_id ){
								zone = GAME.ZONES[ zone_id ]
							}
						}
					}
					SOCKETS[ mud_id ].send(JSON.stringify({
						type: 'npc_pong',
						data: zone._NPCS[ packet.mud_id ].publish()
					}))
					break;

				case 'ping_flora':
					zone = loop_zones( GAME, mud_id )
					if( zone ){
						const flora = lib.publish( zone._FLORA )
						SOCKETS[ mud_id ].send(JSON.stringify({
							type: 'pong_flora',
							data: flora
						}))
					}
					break;

				case 'ping_structures':
					zone = loop_zones( GAME, mud_id )
					if( zone ){
						const structures = lib.publish( zone._STRUCTURES )
						SOCKETS[ mud_id ].send(JSON.stringify({
							type: 'pong_structures',
							data: structures
						}))
					}
					break;

				case 'ping_items':
					zone = loop_zones( GAME, mud_id )
					if( zone ){
						const items = lib.publish( zone._ITEMS )
						SOCKETS[ mud_id ].send(JSON.stringify({
							type: 'pong_items',
							data: items
						}))
					}
					break;

				case 'dev_ping':
					SOCKETS[ mud_id ].send( JSON.stringify({
						type: 'dev_pong',
						data: {
							zones: Object.keys( GAME.ZONES ),
							toons: Object.keys( GAME.get_all_toons() )
						}
					}))
					break;

				// case 'pillar_ping':
				// 	log('router', 'pillar ping')

				// 	SOCKETS[ mud_id ].send( JSON.stringify({
				// 		type: 'pillars',
				// 		pillars: PILLARS
				// 	}))

				// 	break;

				// case 'pillar_ping_single':
				// 	if( PILLARS[ packet.mud_id ]){
				// 		SOCKETS[ mud_id ].send( JSON.stringify({
				// 			type: 'pillar_pong_single',
				// 			pillar: PILLARS[ packet.mud_id ]
				// 		}))
				// 	}
				// 	break;

				case 'move_stream':

					if( TOON ){

						TOON.ref.position = new Vector3(
							packet.ref.position.x,
							packet.ref.position.y,
							packet.ref.position.z
						)
						TOON.ref.quaternion = new Quaternion(
							packet.ref.quaternion._x,
							packet.ref.quaternion._y,
							packet.ref.quaternion._z,
							packet.ref.quaternion._w
						)

						TOON.needs_pulse = true

					}

					break;

				case 'chat':
					GAME.handle_chat( packet, GAME.ZONES[ TOON._current_zone ], mud_id )
					.catch( err => {
						log('flag', 'err chat: ', err )
					})
					break;

				case 'equip':
					TOON.equip( packet.held, packet.slot )
					break;

				case 'drop':
					TOON.drop( packet.held )
					break;

				case 'attack':
					GAME.ZONES[ TOON._current_zone ].resolve_attack( TOON, packet )
					break;
					
				case 'acquire':
					TOON.acquire( GAME.ZONES[ TOON._current_zone ], packet.mud_id )
					break;

				case 'enter_structure':
					TOON.attempt_entry( GAME.ZONES[ TOON._current_zone ], packet.mud_id )
					break;

				case 'exit_structure':
					TOON.exit_structure( GAME.ZONES[ TOON._current_zone ], packet.mud_id )
					break;
				// case 'register':
				// 	auth.register( SOCKETS[ mud_id ].request.session.USER, packet )
				// 	.catch( err => {
				// 		log('flag', 'register err: ', err )
				// 	})
				// 	break;

				// case 'login':
				// 	auth.login( SOCKETS[ mud_id ].request.session.USER, packet )
				// 	.catch( err => {
				// 		log('flag', 'login err: ', err )
				// 	})
				// 	break;

				// case 'logout':
				// 	auth.logout( SOCKETS[ mud_id ].request.session.USER )
				// 	.catch( err => {
				// 		log('flag', 'logout err: ', err )
				// 	})
				// 	break;

				// case 'update_profile':
				// 	log('router', 'update_profile: ', packet )
				// 	auth.update_profile( SOCKETS[ mud_id ].request.session.USER, packet )
				// 	.catch( err => {
				// 		log('flag', 'profile err: ', err )
				// 	})
				// 	break;

				// case 'upload':
				// 	log('flag', 'here she blows: ', packet )
					// break;

				default: break;


			}

		})

		SOCKETS[ mud_id ].on('error', function( data ){

			log('flag', 'socket error: ', data )

		})

		SOCKETS[ mud_id ].on('close', function( data ){
			GAME.purge( SOCKETS[ mud_id ].request.session.USER._TOON )
		})

	}

}



function loop_zones( GAME, mud_id ){

	for( const zone_id of Object.keys( GAME.ZONES )){
		for( const toon_id of Object.keys( GAME.ZONES[ zone_id ]._TOONS )){
			if( toon_id === mud_id ){
				return GAME.ZONES[ zone_id ]
			}
		}
	}

	return false

}















