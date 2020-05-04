import GLOBAL from '../GLOBAL.js'
import { 
	PerspectiveCamera,
	Vector3
} from '../lib/three.module.js'

let camera = false

export default (function(){

	if( camera ) return camera

	camera = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, GLOBAL.VIEW )

	camera.offset = new Vector3( 0, GLOBAL.MAX_CAM * .75, 20)

	// camera.position.set( 0, 300, -40 );

	// camera.up = new THREE.Vector3(0, 0, 1)
	
	return camera

})()