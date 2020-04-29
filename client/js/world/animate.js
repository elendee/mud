import env from '../env.js'

import { Vector3 } from '../lib/three.module.js'

import RENDERER from '../three/RENDERER.js'
import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import SKYBOX from '../three/SKYBOX.js'
// import GROUND from '../three/GROUND.js'
// import PILLARS from './PILLARS.js'
// import BOTS from './BOTS.js'
import * as LIGHT from '../three/LIGHT.js'
// import CONTROLS from './three/CONTROLS.js'
import STATE from './STATE.js'
import MAP from '../MAP.js'


// import PATRONS from './PATRONS.js'


if( env.EXPOSE ) window.RENDERER = RENDERER

let delta, now, then, delta_seconds
const direction = []
const distance = []
const facing = new Vector3()
const FORWARD = new Vector3(0, 0, 1)




export default function animate(){

	if( !STATE.animating ) return false

	requestAnimationFrame( animate )

	now = performance.now()

	delta = now - then

	then = now 

	delta_seconds = delta / 1000

	if( STATE.stream_down ){

		direction[0] = Number( STATE.move.left ) - Number( STATE.move.right )
	    direction[1] = Number( STATE.move.forward ) - Number( STATE.move.back )

	    distance[0] = direction[0] * delta_seconds * window.TOON.speed
	    distance[1] = direction[1] * delta_seconds * window.TOON.speed

	    if(direction[0] != 0 && direction[1] != 0){
			distance[0] *= .7
			distance[1] *= .7
	    }

	    window.TOON.MODEL.translateX( distance[0] )
	    window.TOON.MODEL.translateZ( distance[1] )

		SKYBOX.position.copy( window.TOON.MODEL.position )

		LIGHT.spotlight.position.copy( window.TOON.MODEL.position ).add( LIGHT.offset )

		RENDERER.shadowMap.needsUpdate = true

		GROUND.position.x = window.TOON.MODEL.position.x
		GROUND.position.z = window.TOON.MODEL.position.z

	}

	if( STATE.rotate.left ){
		window.TOON.MODEL.rotation.y += MAP.ROTATE_RATE
	}else if( STATE.rotate.right ){
		window.TOON.MODEL.rotation.y -= MAP.ROTATE_RATE
	}




	// for( const dpkt_id of Object.keys( PATRONS )){ // should not include player
	// 	if( PATRONS[ dpkt_id ].needs_lerp ){
	// 		PATRONS[ dpkt_id ].MODEL.position.lerp( PATRONS[ dpkt_id ].ref.position, .01 )
	// 		if( PATRONS[ dpkt_id ].MODEL.position.distanceTo( PATRONS[ dpkt_id ].ref.position ) < .1 ){
	// 			PATRONS[ dpkt_id ].needs_lerp = false
	// 			// console.log('lerp arrived')
	// 		}
	// 	}
	// 	if( PATRONS[ dpkt_id ].needs_slerp > 0 ){
	// 		PATRONS[ dpkt_id ].MODEL.quaternion.slerp( PATRONS[ dpkt_id ].ref.quaternion, .01 )
	// 		PATRONS[ dpkt_id ].needs_slerp--
	// 		// if( PATRONS[ dpkt_id ].needs_slerp === 0 ) console.log( 'slerp arrived')
	// 	}
	// }


	// for( const dpkt_id of Object.keys( BOTS )){ // should not include player
	// 	if( BOTS[ dpkt_id ].needs_lerp ){
	// 		BOTS[ dpkt_id ].MODEL.position.lerp( BOTS[ dpkt_id ].ref.position, .01 )
	// 		if( BOTS[ dpkt_id ].MODEL.position.distanceTo( BOTS[ dpkt_id ].ref.position ) < .1 ){
	// 			BOTS[ dpkt_id ].needs_lerp = false
	// 			// console.log('lerp arrived')
	// 		}
	// 	}
	// 	if( BOTS[ dpkt_id ].needs_slerp > 0 ){
	// 		BOTS[ dpkt_id ].MODEL.quaternion.slerp( BOTS[ dpkt_id ].ref.quaternion, .02 )
	// 		BOTS[ dpkt_id ].needs_slerp--
	// 		// if( BOTS[ dpkt_id ].needs_slerp === 0 ) console.log( 'slerp arrived')
	// 	}
	// }
	

	// for( const dpkt_id of Object.keys( PILLARS )){
	// 	if( PILLARS[ dpkt_id ].MODEL.position.y > 300 ){
	// 		PILLARS[ dpkt_id ].destruct()
	// 	}else if( PILLARS[ dpkt_id ].ballooning ){
	// 		PILLARS[ dpkt_id ].MODEL.position.y += .2
	// 		PILLARS[ dpkt_id ].MODEL.rotation.y += PILLARS[ dpkt_id ].balloonY
	// 		PILLARS[ dpkt_id ].MODEL.rotation.z += PILLARS[ dpkt_id ].balloonZ
	// 	}
	// }


	RENDERER.render( SCENE, CAMERA )
	// console.log('ya')

}