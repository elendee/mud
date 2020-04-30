import env from '../env.js'

import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'
import * as LIGHT from '../three/LIGHT.js'

import GLOBAL from '../GLOBAL.js'

import * as KEYS from './ui/KEYS.js'
import * as MOUSE from './ui/MOUSE.js'
import CHAT from './ui/CHAT.js'
// import DIALOGUE from './'

import * as ANIMATE from './animate.js'

import {
	Vector3,
	PlaneBufferGeometry,
	MeshLambertMaterial,
	DoubleSide,
	Mesh
} from '../lib/three.module.js'

if( env.EXPOSE ){
	window.SCENE = SCENE
}

class Zone {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init )){
			this[ key ] = init[ key ]
		}

	}

	initialize(){

		KEYS.init()
		MOUSE.init()
		CHAT.init()
		// DIALOGUE.init()

		const TOON = window.TOON

		TOON.model('self')

		// TOON.MODEL.position.set( 
		// 	TOON.ref.position.x + Math.floor( Math.random() * 10 ), 
		// 	TOON.height / 2, 
		// 	TOON.ref.position.z + Math.floor( Math.random() * 10 )
		// )

		TOON.MODEL.position.set( 0, 0, 0 )

		// TOON.MODEL.add( LIGHT.spotlight )
		SCENE.add( LIGHT.spotlight )
		LIGHT.spotlight.target = TOON.MODEL
		SCENE.add( LIGHT.hemispherical )

		SCENE.add( TOON.MODEL )

		// TOON.HEAD.add( CAMERA )
		TOON.MODEL.add( CAMERA )

		CAMERA.position.set( 0, 100, 0 )



		setTimeout(function(){
			// CAMERA.lookAt( window.TOON.MODEL.position.clone().add( TOON.HEAD.position ) )
			CAMERA.lookAt( TOON.MODEL.position ) 

			RENDERER.frame( SCENE )

		}, 100 )

		TOON.begin_stream()

		CHAT.begin_pulse()

		window.CAMERA = CAMERA

	}



	render(){

		const geometry = new PlaneBufferGeometry( GLOBAL.TILE_WIDTH, GLOBAL.TILE_WIDTH, 32 )
		const material = new MeshLambertMaterial({ 
			color: 0x222200, 
			side: DoubleSide 
		})

		let tile

		for( let x = 0; x < 3; x++ ){
			for( let z = 0; z < 3; z++ ){
				
				const ground = new Mesh( geometry, material )
				ground.receiveShadow = true
				ground.rotation.x = Math.PI / 2
				ground.position.set( x * GLOBAL.TILE_WIDTH + ( x ), .1, z * GLOBAL.TILE_WIDTH  + ( z ))
				SCENE.add( ground )

			}	
		}

	}

}





let zone = false

export default (function(){
	if( zone ) return zone
	zone = new Zone()
	return zone
})();

