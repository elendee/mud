import { 
	PCFSoftShadowMap,
	WebGLRenderer 
} from '../lib/three.module.js'

import CAMERA from './CAMERA.js'

import GLOBAL from '../GLOBAL.js'

let renderer = false

export default (function(){

	if(renderer) return renderer

	renderer = new WebGLRenderer( { 
		antialias: false,
		alpha: true
	} )

	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( 
		window.innerWidth / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
		window.innerHeight / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
		false 
	)

	renderer.shadowMap.enabled = true
	renderer.shadowMap.autoUpdate = true
// 	renderer.shadowMap.type = PCFSoftShadowMap

// 	renderer.shadowCameraNear = 3;
// 	renderer.shadowCameraFar = 1000;
// 	renderer.shadowCameraFov = 50;

// 	renderer.shadowMapBias = 0.0039;
// renderer.shadowMapDarkness = 0.5;
// renderer.shadowMapWidth = 1024;
// renderer.shadowMapHeight = 1024;

	renderer.domElement.id = 'mud-flats'
	renderer.domElement.tabindex = 1

	renderer.onWindowResize = function(){

		CAMERA.aspect = window.innerWidth / window.innerHeight
		CAMERA.updateProjectionMatrix()

		renderer.setSize( 
			window.innerWidth / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
			window.innerHeight / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
			false 
		)

	}

	renderer.frame = function( scene ){

		renderer.render( scene, CAMERA )

	}

	// renderer.physicallyCorrectLights = true //accurate lighting that uses the SI units

	// renderer.domElement.classList.add('input-frame')
	// renderer.domElement.classList.add('input-frame--has-focus')

	// renderer.custom_prop = 'blorble'

	// console.log(renderer)

	// console.log('disabling renderer logs to prevent shader warnings in Firefox')
	// renderer.context.getShaderInfoLog = function () { return '' }
	// renderer.getContext.getShaderInfoLog = function () { return '' }

	document.body.appendChild( renderer.domElement )

	return renderer

})()


// export { init }


