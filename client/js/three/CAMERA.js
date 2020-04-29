import GLOBAL from '../GLOBAL.js'
import { 
	PerspectiveCamera
} from '../lib/three.module.js'

let camera = false

export default (function(){

	if( camera ) return camera

	camera = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, GLOBAL.VIEW )

	// camera.position.set( 0, 300, -40 );

	// camera.up = new THREE.Vector3(0, 0, 1)
	
	return camera

})()