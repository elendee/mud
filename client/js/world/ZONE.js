import env from '../env.js'

import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import * as LIGHT from '../three/LIGHT.js'

import * as KEYS from './ui/KEYS.js'
import * as MOUSE from './ui/MOUSE.js'
import CHAT from './ui/CHAT.js'
// import DIALOGUE from './'

import animate from './animate.js'

if( env.EXPOSE ){
	window.SCENE = SCENE
}

class Zone {
	
	constructor( init ){

		init = init || {}

	}

	initialize(){

		KEYS.init()
		MOUSE.init()
		CHAT.init()
		// DIALOGUE.init()

		const TOON = window.TOON

		TOON.model( 'self' )

		TOON.MODEL.position.set( 
			TOON.ref.position.x + Math.floor( Math.random() * 10 ), 
			TOON.height / 2, 
			TOON.ref.position.z + Math.floor( Math.random() * 10 )
		)

		SCENE.add( LIGHT.spotlight )
		LIGHT.spotlight.target = TOON.MODEL
		SCENE.add( LIGHT.hemispherical )

		SCENE.add( TOON.MODEL )

		CAMERA.position.set( 0, 8, -50 )

		// TOON.HEAD.add( CAMERA )
		TOON.MODEL.add( CAMERA )

		setTimeout(function(){
			// CAMERA.lookAt( window.TOON.MODEL.position.clone().add( TOON.HEAD.position ) )
			CAMERA.lookAt( window.TOON.MODEL.position.clone().add( TOON.MODEL.position ) )
		}, 100 )

		TOON.begin_stream()

		CHAT.begin_pulse()

		window.CAMERA = CAMERA

		animate()	

	}



	render_zone(){

		console.log('render_zone....')

		// animate()

		// PROXIMALS.start()

		// setTimeout(function(){
		// 	window.SOCKET.send(JSON.stringify({
		// 		type: 'zone_ping'
		// 	}))
		// }, 500)
		// setTimeout(function(){
		// 	window.SOCKET.send(JSON.stringify({
		// 		type: 'floorplan_ping'
		// 	}))
		// }, 1500)
		// setTimeout(function(){
		// 	window.SOCKET.send(JSON.stringify({
		// 		type: 'forest_ping'
		// 	}))
		// }, 5000)

		// window.PATRONS = PATRONS
		// window.PILLARS = PILLARS
		// window.CONTROLS = CONTROLS

	}

}





let zone = false

export default (function(){
	if( zone ) return zone
	zone = new Zone()
	return zone
})();

