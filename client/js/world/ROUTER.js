import env from '../env.js'

import hal from '../hal.js'
import * as lib from '../lib.js'

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

			let packet = false

			try{
				packet = JSON.parse( msg.data )	
			}catch(e){
				SOCKET.bad_messages++
				if( SOCKET.bad_messages > 100 ) {
					console.log('100+ faulty socket messages', msg )
					SOCKET.bad_messages = 0
				}
				console.log('failed to parse server msg: ', msg )
				return false	
			}



			// console.log('packet rcvd: ', packet )

			switch( packet.type ){

				case 'session_init':
					console.log('got init: ', packet )
					for( const key of Object.keys( packet.map )){
						MAP[ key ] = packet.map[ key ]
					}
					window.MAP = MAP
					resolve( packet )
					break;

				case 'move_pulse':
					ZONE.handle_move( packet.data )
					break;

				// case 'census':
				// 	ZONE.census( packet.crowd )
				// 	break;

				// case 'profile_pong':
				// 	ZONE.touch_patron( packet.patron )
				// 	break;

				// case 'floorplan_pong':
				// 	ZONE.layout( packet.floorplan )
				// 	break;

				case 'pong_flora':
					ZONE.render_flora( packet.data ).catch( err => {
						console.log('err render flora: ', err )
					})
					break;

				case 'pong_structures':
					ZONE.render_structures( packet.data ).catch( err => {
						console.log('err render structures: ', err )
					})
					break;

				case 'pong_items':
					ZONE.render_items( packet.data )
					// .catch( err => {
					// 	console.log('err render items: ', err )
					// })
					break;

				case 'toon_pong':
					ZONE.touch_toon( packet.data )
					break;

				case 'dev_pong':
					DEV.render('pong', packet.data )
					break;

				// case 'forest_pong':
				// 	ZONE.walk_forest( packet.forest )
				// 	break;

				// case 'pillars':
				// 	if( packet.pillars ){
				// 		ZONE.install( packet.pillars, false )
				// 	}else{
				// 		setTimeout(function(){
				// 			SOCKET.send( JSON.stringify({ 
				// 				type: 'pillar_ping' 
				// 			}))
				// 		}, 1000 )
				// 	}
				// 	break;

				case 'chat':
					CHAT.add_chat( ZONE, packet.data )
					break;

				case 'login':
					// console.error('finish switching logout to http .... ')
					// if( packet.success ) {
						// if( packet.patron.mud_id === window.TOON.mud_id ){
						// 	hal('success', 'welcome back!', 3000)
						// }
						ZONE.touch_patron( packet.patron )
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
					// if( packet.success ) {
					if( packet.patron.mud_id === window.TOON.mud_id ){
						hal('success', 'artist created', 4000)
					}
					ZONE.touch_patron( packet.patron )
					// }
					break;

				case 'profile':
					// console.error('finish switching update to http .... ')
					// if( packet.msg == 'success' ){
					ZONE.update_toon( packet )
					// }else{
					// 	console.log('error changing profile: ', packet )
					// }
					break;

				case 'new_img':
					ZONE.new_img( packet )
					break;

				case 'equip':
					window.TOON.refresh_equipped( packet.equipment )
					break;

				case 'set_inventory':
					window.TOON.set_inventory( packet.data )
					break;

				case 'combat_resolution':
					ZONE.apply_resolution( packet.type, packet.data )
					break;

				case 'zone_remove_item':
					ZONE.remove_item( packet.data )
					// ZONE.clear_acquisition( packet.mud_id )
					break;

				case 'entry':
					ZONE.handle_entry( packet.data )
					break;




				case 'error':
					hal('error', packet.msg, packet.time, packet.redirect )
					break;

				case 'hal':
					hal( packet.hal_type, packet.msg, packet.time || 10000 )
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