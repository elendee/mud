const log = require('./log.js')

const SOCKETS = require('./SOCKETS.js')
// const TREES = require('./TREES.js')
// const FLOORPLAN = require('./FLOORPLAN.js')( false )
// const PILLARS = require('./PILLARS.js')
// const BOTS = require('./BOTS.js')

module.exports = function emit( type, data ){

	const gallery = this

	switch( type ){

		case 'floorplan_pong':
			SOCKETS[ data.mud_id ].send(JSON.stringify({
				type: type,
				floorplan: FLOORPLAN
			}))
			break;

		case 'forest_pong':
			SOCKETS[ data.mud_id ].send(JSON.stringify({
				type: type,
				forest: TREES
			}))
			break;

		case 'bot_pong':
			if( BOTS[ data.bot_mud_id ] ){
				SOCKETS[ data.mud_id ].send(JSON.stringify({
					type: type,
					bot: BOTS[ data.bot_mud_id ],
					// position: BOTS[ data.bot_mud_id ].ref.position,
					// quaternion: BOTS[ data.bot_mud_id ].ref.quaternion
				}))
			}else{
				log('flag', 'missing requested bot: ', data.bot_mud_id, Object.keys( BOTS ) )
			}
			break;

		case 'move_pulse':
			for( const mud_id of Object.keys( SOCKETS ) ){
				SOCKETS[ mud_id ].send(JSON.stringify({
					type: type,
					bundle: data
				}))
			}
			log('move', 'move_pulse:', Object.keys( data ).length + ' emit(s)' )
			break;

		case 'census':
			for( const mud_id of Object.keys( SOCKETS ) ){
				SOCKETS[ mud_id ].send(JSON.stringify({
					type: type,
					crowd: data
				}))
			}
			break;

		case 'pillars':
			for( const mud_id of Object.keys( SOCKETS ) ){
				SOCKETS[ mud_id ].send(JSON.stringify({
					type: type,
					pillars: PILLARS
				}))
			}
			break;

		case 'bot_pulse':
			log('flag', 'bot_pulse  should be deprecated...')
			// for( const mud_id of Object.keys( SOCKETS ) ){
			// 	SOCKETS[ mud_id ].send(JSON.stringify({
			// 		type: type,
			// 		packet: data
			// 	}))
			// }
			break;

		default: break;

	}

}