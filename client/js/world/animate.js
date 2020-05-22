import env from '../env.js'
import * as lib from '../lib.js'

import DEV from './ui/DEV.js'

import { Vector3 } from '../lib/three.module.js'

import RENDERER from '../three/RENDERER.js'
import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
//import SKYBOX from '../three/SKYBOX.js'
// import GROUND from '../three/GROUND.js'
// import PILLARS from './PILLARS.js'
import TOONS from './TOONS.js'
import * as LIGHT from '../three/LIGHT.js'
// import CONTROLS from './three/CONTROLS.js'
import STATE from './STATE.js'
import MAP from '../MAP.js'



if( env.EXPOSE ) window.RENDERER = RENDERER

let delta, now, then, delta_seconds
const direction = []
const distance = []
const facing = new Vector3()
const FORWARD = new Vector3(0, 0, 1)

const moving_toons = []
const rotating_toons = []



function update_compass(){
	STATE.compassing = true
	document.getElementById('compass-arrow').style.transform = 'rotate(' + Math.floor( lib.radians_to_degrees( TOON.MODEL.rotation.y ) ) + 'deg)'
	setTimeout(function(){
		document.getElementById('compass-arrow').style.transform = 'rotate(' + Math.floor( lib.radians_to_degrees( TOON.MODEL.rotation.y ) ) + 'deg)'
		STATE.compassing = false
	}, 1000 )
}


function move( dir, pressed ){

	if( dir == 'forward' ){

		STATE.move.forward = pressed
		if( pressed ){
			if( STATE.move.left ){
				TOON.look_at(false, 'northwest')
			}else if( STATE.move.right ){
				TOON.look_at(false, 'northeast')
			}else{
				TOON.look_at(false, 'north')
			}
			STATE.stream_down = true
			window.TOON.needs_stream = true
			if( !STATE.animating ) animate( true )
		}else{
			check_stream()
		}

	}else if( dir == 'back' ){

		STATE.move.back = pressed
		if( pressed ){
			if( STATE.move.left ){
				TOON.look_at(false, 'southwest')
			}else if( STATE.move.right ){
				TOON.look_at(false, 'southeast')
			}else{
				TOON.look_at(false, 'south')
			}
			STATE.stream_down = true
			window.TOON.needs_stream = true
			if( !STATE.animating ) animate( true )
		}else{
			check_stream()
		}

	}else if( dir == 'left' ){

		STATE.move.left = pressed
		if( pressed ){
			if( STATE.move.forward ){
				TOON.look_at(false, 'northwest')
			}else if( STATE.move.back ){
				TOON.look_at(false, 'southwest')
			}else{
				TOON.look_at(false, 'west')
			}
			STATE.stream_down = true
			window.TOON.needs_stream = true
			if( !STATE.animating ) animate( true )
		}else{
			check_stream()
		}

	}else if( dir == 'right' ){

		STATE.move.right = pressed
		if( pressed ){
			if( STATE.move.forward ){
				TOON.look_at(false, 'northeast')
			}else if( STATE.move.back ){
				TOON.look_at(false, 'southeast')
			}else{
				TOON.look_at(false, 'east')
			}
			STATE.stream_down = true
			window.TOON.needs_stream = true
			if( !STATE.animating ) animate( true )
		}else{
			check_stream()
		}

	}else if( dir == 'cancel' ){

		STATE.rotate.right = STATE.rotate.left = STATE.move.forward = STATE.move.back = false
		STATE.stream_down = false

	}

}


function analog_turn( amount ){

	if( amount ){
		window.TOON.MODEL.rotation.y -= amount
		window.TOON.needs_stream = true
		STATE.stream_down = true
		if( !STATE.animating ) animate( true )
	}else{
		check_stream()
	}

	if( !STATE.compassing ) update_compass()

}

function digital_turn( dir, pressed ){

	switch( dir ){
		case 'left':
			STATE.rotate.left = pressed
			break;

		case 'right':
			STATE.rotate.right = pressed
			break;

		default: break;
	}

	if( pressed ){
		STATE.stream_down = true
		window.TOON.needs_stream = true
		if( !STATE.animating ) animate( true )
	}else{
		check_stream()
	}

	if( !STATE.compassing ) update_compass()

}



function receive_move( mud_id ){
	if( !moving_toons.includes( mud_id ) ){
		moving_toons.push( mud_id )
		if( !STATE.animating )  animate( true )
	}
}


function receive_rotate( mud_id ){
	if( !moving_toons.includes( mud_id ) ){
		moving_toons.push( mud_id )
		if( !STATE.animating )  animate( true )
	}	
}




function check_stream(){
	if( !STATE.move.forward && !STATE.move.back && !STATE.move.left && !STATE.move.right ){
		STATE.stream_down = false
	}
}



function animate( start ){

	if( typeof( start ) === 'boolean' ){
		then = performance.now()
		// console.log('anim start', start )
	}

	STATE.animating = true

	if( !STATE.stream_down && !moving_toons.length && !rotating_toons.length ){ // && !x && !y ....
		// console.log('anim end')
		STATE.animating = false
		return false
	}

	requestAnimationFrame( animate )

	now = performance.now()

	delta = now - then

	then = now 

	delta_seconds = delta / 1000

	DEV.render('modulo')

	if( STATE.stream_down ){

		direction[0] = Number( STATE.move.right ) - Number( STATE.move.left )
	    direction[1] = Number( STATE.move.back ) - Number( STATE.move.forward )

	    distance[0] = direction[0] * delta_seconds * window.TOON.speed
	    distance[1] = direction[1] * delta_seconds * window.TOON.speed

	    if(direction[0] != 0 && direction[1] != 0){
			distance[0] *= .7
			distance[1] *= .7
	    }

	    // console.log( distance[0])

	    window.TOON.MODEL.translateX( distance[0] )
	    window.TOON.MODEL.translateZ( distance[1] )

	    // bounds:
	    window.TOON.MODEL.position.x = Math.min( Math.max( 0, window.TOON.MODEL.position.x ), MAP.ZONE_WIDTH )
	    window.TOON.MODEL.position.z = Math.min( Math.max( 0, window.TOON.MODEL.position.z ), MAP.ZONE_WIDTH )

	    CAMERA.position.copy( window.TOON.MODEL.position ).add( CAMERA.offset )

		// SKYBOX.position.copy( window.TOON.MODEL.position )

		// LIGHT.spotlight.position.copy( window.TOON.MODEL.position ).add( LIGHT.offset )

		RENDERER.shadowMap.needsUpdate = true

		// GROUND.position.x = window.TOON.MODEL.position.x
		// GROUND.position.z = window.TOON.MODEL.position.z

	}

	if( STATE.rotate.left ){
		window.TOON.MODEL.rotation.y += MAP.ROTATE_RATE
	}else if( STATE.rotate.right ){
		window.TOON.MODEL.rotation.y -= MAP.ROTATE_RATE
	}

	for( const mud_id of Object.keys( TOONS )){ // should not include player
		if( TOONS[ mud_id ].needs_move ){
			TOONS[ mud_id ].MODEL.position.lerp( TOONS[ mud_id ].ref.position, .02 )
			if( TOONS[ mud_id ].MODEL.position.distanceTo( TOONS[ mud_id ].ref.position ) < .05 ){
				TOONS[ mud_id ].needs_move = false
				moving_toons.splice( moving_toons.indexOf( mud_id ), 1 )
				// delete moving_toons[ mud_id ]
				// console.log('lerp arrived')
			}
		}
		if( TOONS[ mud_id ].needs_rotate > 0 ){
			TOONS[ mud_id ].MODEL.quaternion.slerp( TOONS[ mud_id ].ref.quaternion, .01 )
			TOONS[ mud_id ].needs_rotate--
			if( TOONS[ mud_id ].needs_rotate === 0 ){
				// console.log( 'slerp arrived')
				// TOONS[ mud_id ].
				rotating_toons.splice( rotating_toons.indexOf( mud_id ), 1 )
			}
		}
	}

	// for( const mud_id of Object.keys( BOTS )){ // should not include player
	// 	if( BOTS[ mud_id ].needs_move ){
	// 		BOTS[ mud_id ].MODEL.position.lerp( BOTS[ mud_id ].ref.position, .01 )
	// 		if( BOTS[ mud_id ].MODEL.position.distanceTo( BOTS[ mud_id ].ref.position ) < .1 ){
	// 			BOTS[ mud_id ].needs_move = false
	// 			// console.log('lerp arrived')
	// 		}
	// 	}
	// 	if( BOTS[ mud_id ].needs_rotate > 0 ){
	// 		BOTS[ mud_id ].MODEL.quaternion.slerp( BOTS[ mud_id ].ref.quaternion, .02 )
	// 		BOTS[ mud_id ].needs_rotate--
	// 		// if( BOTS[ mud_id ].needs_rotate === 0 ) console.log( 'slerp arrived')
	// 	}
	// }
	
	// for( const mud_id of Object.keys( PILLARS )){
	// 	if( PILLARS[ mud_id ].MODEL.position.y > 300 ){
	// 		PILLARS[ mud_id ].destruct()
	// 	}else if( PILLARS[ mud_id ].ballooning ){
	// 		PILLARS[ mud_id ].MODEL.position.y += .2
	// 		PILLARS[ mud_id ].MODEL.rotation.y += PILLARS[ mud_id ].balloonY
	// 		PILLARS[ mud_id ].MODEL.rotation.z += PILLARS[ mud_id ].balloonZ
	// 	}
	// }

	RENDERER.render( SCENE, CAMERA )
	// console.log('ya')

}




export { 
	move,
	analog_turn,
	digital_turn,
	moving_toons,
	rotating_toons,
	receive_move,
	receive_rotate
}
