import env from '../env.js'

import hal from '../hal.js'

import ZONE from './ZONE.js'

import DEV from './ui/DEV.js'

// import * as DIALOGUE from './ui/DIALOGUE.js'

import CHAT from './ui/CHAT.js'

import MAP from '../MAP.js'

const bind = function(){

	return new Promise(function( resolve, reject ){

		const SOCKET = window.SOCKET = new WebSocket( env.WS_URL )

		// USER.SOCKET = SOCKET

		SOCKET.onopen = function( event ){

			console.log('connected ws' )

		}


		SOCKET.onmessage = function( msg ){

			let obj = false

			try{
				obj = JSON.parse( msg.data )	
			}catch(e){
				SOCKET.bad_messages++
				if( SOCKET.bad_messages > 100 ) {
					console.log('100+ faulty socket messages', msg )
					SOCKET.bad_messages = 0
				}
				console.log('failed to parse server msg: ', msg )
				return false	
			}



			// console.log('packet rcvd: ', obj )

			switch( obj.type ){

				case 'session_init':
					console.log('got init: ', obj )
					for( const key of Object.keys( obj.map )){
						MAP[ key ] = obj.map[ key ]
					}
					window.MAP = MAP
					resolve( obj )
					break;

				case 'move_pulse':
					ZONE.handle_move( obj.packet )
					break;

				// case 'census':
				// 	ZONE.census( obj.crowd )
				// 	break;

				case 'profile_pong':
					ZONE.touch_patron( obj.patron )
					break;

				// case 'floorplan_pong':
				// 	ZONE.layout( obj.floorplan )
				// 	break;

				case 'toon_pong':
					ZONE.touch_toon( obj )
					break;

				case 'dev_pong':
					DEV.render('pong', obj )
					break;

				// case 'forest_pong':
				// 	ZONE.walk_forest( obj.forest )
				// 	break;

				// case 'pillars':
				// 	if( obj.pillars ){
				// 		ZONE.install( obj.pillars, false )
				// 	}else{
				// 		setTimeout(function(){
				// 			SOCKET.send( JSON.stringify({ 
				// 				type: 'pillar_ping' 
				// 			}))
				// 		}, 1000 )
				// 	}
				// 	break;

				case 'chat':
					CHAT.add_chat( obj )
					break;

				case 'login':
					// console.error('finish switching logout to http .... ')
					// if( obj.success ) {
						// if( obj.patron.mud_id === window.TOON.mud_id ){
						// 	hal('success', 'welcome back!', 3000)
						// }
						ZONE.touch_patron( obj.patron )
					// }
					break;

				case 'logout':
					console.error('finish switching logout to http .... ')
					// hal('npc', 'adios!')
					// setTimeout(function(){
					// 	location.reload()
					// }, 1000)
					break;

				case 'register':
					// console.error('finish switching register to http .... ')
					// if( obj.success ) {
					if( obj.patron.mud_id === window.TOON.mud_id ){
						hal('success', 'artist created', 4000)
					}
					ZONE.touch_patron( obj.patron )
					// }
					break;

				case 'profile':
					// console.error('finish switching update to http .... ')
					// if( obj.msg == 'success' ){
					ZONE.update_toon( obj )
					// }else{
					// 	console.log('error changing profile: ', obj )
					// }
					break;

				case 'new_img':
					ZONE.new_img( obj )
					break;

				case 'equip':
					window.TOON.refresh_equipped( obj.equipment )
					break;

				case 'inventory':
					window.TOON.init_inventory( obj.inventory )
					break;

				case 'combat':
					ZONE.apply_resolution( obj.resolution )
					break;

				case 'decomposers':
					ZONE.render_decomposers( obj.packet )
					break;

				case 'loot':
					console.log('got LOOT', obj )
					break;

				// case 'bot_begin_path':
				// 	ZONE.handle_bot( obj )
				// 	break;

				// case 'bot_walk':
				// 	ZONE.handle_bot( obj )
				// 	break;

				// case 'bot_pulse':
				// 	console.log('bot pulse should be deprecated...')
				// 	ZONE.handle_bot( obj )
				// 	break;

				// case 'bot_thought':
				// 	ZONE.handle_bot( obj )
				// 	break;

				// case 'zoom':
				// 	window.TOON.zoom()
				// 	break;

				// case 'pulse_pillar_key':
				// 	ZONE.check_pillar_keys( obj.keys )
				// 	break;

				// case 'pillar_ping_single':
				// 	console.log('single...')
				// 	// ZONE.install( obj.pillar, true )
				// 	break;

				case 'error':
					hal('error', obj.msg, obj.time, obj.redirect )
					break;

				case 'hal':
					hal( obj.hal_type, obj.msg, obj.time || 10000 )
					break;

				default: break;

			}

		}


		SOCKET.onerror = function( data ){
			console.log('ERROR', data)
			hal('error', 'server error')
		}



		SOCKET.onclose = function( event ){
			hal('error', 'connection closed')
		}



	})


}


export { 
	bind
}