import env from './env.js'

import GLOBAL from './GLOBAL.js'

import {
	Object3D,
	PCFSoftShadowMap,
	WebGLRenderer 
} from './lib/three.module.js'

import SCENE from './three/SCENE.js'
// import RENDERER from './three/RENDERER.js'
import CAMERA from './three/CAMERA.js'
import * as LIGHT from './three/LIGHT.js'

import GLTFLoader from './three/loader_GLTF.js'

import MAP from './MAP.js'



const RENDERER = window.RENDERER = new WebGLRenderer( { 
	antialias: true,
	alpha: true
} )

RENDERER.setPixelRatio( window.devicePixelRatio )
RENDERER.setSize( 
	window.innerWidth / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
	window.innerHeight / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
	false 
)

RENDERER.shadowMap.enabled = true
RENDERER.shadowMap.autoUpdate = true

RENDERER.domElement.id = 'mud-flats'
RENDERER.domElement.tabindex = 1

RENDERER.frame = function( scene ){

	RENDERER.render( scene, CAMERA )

}


	document.body.appendChild( RENDERER.domElement )


RENDERER.onWindowResize = function(){

	CAMERA.aspect = window.innerWidth / ( window.innerHeight )
	CAMERA.updateProjectionMatrix()

	if( window.innerWidth < 1000 ){
		CAMERA.position.z = 15
		CAMERA.position.y = -1.5
	}else{
		CAMERA.position.set( 0,-.7, 10 )
	}

	// RENDERER.setSize( 
	// 	window.innerWidth / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
	// 	( window.innerHeight / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ] ) / 2, 
	// 	false 
	// )

	RENDERER.frame( SCENE )
}

window.addEventListener( 'resize', RENDERER.onWindowResize, false )



document.addEventListener('DOMContentLoaded', function(){

	SCENE.add( LIGHT.hemispherical )
	// SCENE.add( LIGHT.spotlight )
	SCENE.add( LIGHT.directional )
	// LIGHT.directional.position.set( MAP.ZONE_WIDTH * .66, 100, MAP.ZONE_WIDTH * .66 )
	LIGHT.directional.position.set( 5, 5, 15 )
	LIGHT.directional.intensity = 6

	SCENE.add( CAMERA )
	// copy( window.TOON.MODEL.position ).add( CAMERA.offset )

	// RENDERER.setSize( 200, 600, false )

	let iter = 0

	GLTFLoader.load('/resource/geometries/sword/scene.gltf', function( obj ){

		const sword1 = window.sword1 = obj.scene

		sword1.position.set( 0,0,0 )
		
		CAMERA.lookAt( sword1.position )
		if( window.innerWidth < 1000 ){
			CAMERA.position.z = 15
			CAMERA.position.y = -1.5
		}else{
			CAMERA.position.set( 0,-.7, 10 )
		}
		
		LIGHT.directional.target = sword1
		
		sword1.rotation.x = -7
		sword1.rotation.z = .8

		sword1.position.x -= .6
		sword1.position.y = 2


		CAMERA.aspect = window.innerWidth / ( window.innerHeight )
		CAMERA.updateProjectionMatrix()

		SCENE.add( sword1 )

		RENDERER.frame( SCENE )
		// RENDERER.antialias = true

		setInterval(function(){
			sword1.rotation.x = Math.sin( iter ) / 3.5
			iter += .12
			// sword1.rotation.x += .01
			// sword2.rotation.z -= .08
			// sword2.rotation.x -= .01
			// console.log( Math.sin( sword1.rotation.z ) )
			RENDERER.frame( SCENE )
		}, 50)
	})

	if( env.EXPOSE ){
		window.CAMERA = CAMERA
		window.RENDERER  = RENDERER
		window.SCENE = SCENE
	}

	// document.addEventListener('mousemove', canvas_track )
	document.addEventListener('mousemove', light_track )

})

function light_track( e ){

	LIGHT.directional.position.x = e.clientX / 100
	LIGHT.directional.position.y = ( window.innerHeight / 100 ) - e.clientY / 100

}

function canvas_track( e ){

	RENDERER.domElement.style.top = e.clientY + 'px'
	RENDERER.domElement.style.left = e.clientX + 'px'

}

export default true