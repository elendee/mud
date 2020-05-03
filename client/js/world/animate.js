import env from '../env.js'

import DEV from './ui/DEV.js'

import { Vector3 } from '../lib/three.module.js'

import RENDERER from '../three/RENDERER.js'
import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import SKYBOX from '../three/SKYBOX.js'
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



function move( dir, pressed ){
	switch( dir ){
		case 'forward':
			STATE.move.forward = pressed
			if( pressed ){
				STATE.stream_down = true
				window.TOON.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'back':
			STATE.move.back = pressed
			if( pressed ){
				STATE.stream_down = true
				window.TOON.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'left':
			STATE.move.left = pressed
			if( pressed ){
				STATE.stream_down = true
				window.TOON.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'right':
			STATE.move.right = pressed
			if( pressed ){
				STATE.stream_down = true
				window.TOON.needs_stream = true
				if( !STATE.animating ) animate( true )
			}else{
				check_stream()
			}
			break;

		case 'cancel':
			STATE.rotate.right = STATE.rotate.left = STATE.move.forward = STATE.move.back = false
			STATE.stream_down = false
			break;

		default: break;
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

		direction[0] = Number( STATE.move.left ) - Number( STATE.move.right )
	    direction[1] = Number( STATE.move.forward ) - Number( STATE.move.back )

	    distance[0] = direction[0] * delta_seconds * window.TOON.speed
	    distance[1] = direction[1] * delta_seconds * window.TOON.speed

	    if(direction[0] != 0 && direction[1] != 0){
			distance[0] *= .7
			distance[1] *= .7
	    }

	    // console.log( distance[0])

	    window.TOON.MODEL.translateX( distance[0] )
	    window.TOON.MODEL.translateZ( distance[1] )

	    window.TOON.MODEL.position.x = Math.min( Math.max( 0, window.TOON.MODEL.position.x ), MAP.ZONE_WIDTH )
	    window.TOON.MODEL.position.z = Math.min( Math.max( 0, window.TOON.MODEL.position.z ), MAP.ZONE_WIDTH )

		// SKYBOX.position.copy( window.TOON.MODEL.position )

		LIGHT.spotlight.position.copy( window.TOON.MODEL.position ).add( LIGHT.offset )

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
			TOONS[ mud_id ].MODEL.position.lerp( TOONS[ mud_id ].ref.position, .01 )
			if( TOONS[ mud_id ].MODEL.position.distanceTo( TOONS[ mud_id ].ref.position ) < .1 ){
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