const log = require('./log.js')
const env = require('./.env.js')
const lib = require('./lib.js')
const SOCKETS = require('./SOCKETS.js')
// const PILLARS = require('./PILLARS.js')

const EMIT = require('./EMIT.js')

const auth = require('./auth.js')

// const { Vector3, Quaternion } = require('three')

// const TREES = require('./TREES.js')
// const BOTS = require('./BOTS.js')

let loc_type, loc_id, LOCATION

module.exports = {

	bind_user: function( GALLERY, mud_id ){

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

			switch( packet.type ){

				case 'profile_ping':

					if( SOCKETS[ packet.mud_id ]){
						SOCKETS[ mud_id ].send(JSON.stringify({
							type: 'profile_pong',
							patron: SOCKETS[ packet.mud_id ].request.session.PATRON.publish()
						}))
					}

					break;

				case 'pillar_ping':
					log('router', 'pillar ping')

					// const response = Object.assign( {}, PILLARS )

					SOCKETS[ mud_id ].send( JSON.stringify({
						type: 'pillars',
						pillars: PILLARS
					}))

					// log('flag', 'len: ', Object.keys( PILLARS ).length )

					break;

				case 'pillar_ping_single':
					if( PILLARS[ packet.mud_id ]){
						SOCKETS[ mud_id ].send( JSON.stringify({
							type: 'pillar_pong_single',
							pillar: PILLARS[ packet.mud_id ]
						}))
					}
					break;

				case 'floorplan_ping':
					log('router', 'floorplan ping')

					EMIT( 'floorplan_pong', { mud_id: mud_id } )
					break;

				case 'bot_ping':
					log('router', 'bot ping, req: ', packet.mud_id )
					EMIT( 'bot_pong', { 
						mud_id: mud_id,
						bot_mud_id: packet.mud_id
					} )
					break;

				case 'forest_ping':
					log('router', 'forest_ping')
					EMIT( 'forest_pong', { mud_id: mud_id } )
					// log('flag', 'emitting: ', TREES )
					break;

				case 'move_stream':

					if( SOCKETS[ mud_id ] && SOCKETS[ mud_id ].request.session.PATRON ){

						SOCKETS[ mud_id ].request.session.PATRON.ref.position = new Vector3(
							packet.ref.position.x,
							packet.ref.position.y,
							packet.ref.position.z
						)
						SOCKETS[ mud_id ].request.session.PATRON.ref.quaternion = new Quaternion(
							packet.ref.quaternion._x,
							packet.ref.quaternion._y,
							packet.ref.quaternion._z,
							packet.ref.quaternion._w
						)

						SOCKETS[ mud_id ].request.session.PATRON.needs_pulse = true

					}

					break;

				case 'chat':
					GALLERY.handle_chat( packet, mud_id )
					break;

				// case 'register':
				// 	auth.register( SOCKETS[ mud_id ].request.session.PATRON, packet )
				// 	.catch( err => {
				// 		log('flag', 'register err: ', err )
				// 	})
				// 	break;

				// case 'login':
				// 	auth.login( SOCKETS[ mud_id ].request.session.PATRON, packet )
				// 	.catch( err => {
				// 		log('flag', 'login err: ', err )
				// 	})
				// 	break;

				// case 'logout':
				// 	auth.logout( SOCKETS[ mud_id ].request.session.PATRON )
				// 	.catch( err => {
				// 		log('flag', 'logout err: ', err )
				// 	})
				// 	break;

				// case 'update_profile':
				// 	log('router', 'update_profile: ', packet )
				// 	auth.update_profile( SOCKETS[ mud_id ].request.session.PATRON, packet )
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

			if( SOCKETS[ mud_id ] )  delete SOCKETS[ mud_id ]

			log('connection', 'socket close')

		})

	}

}





















