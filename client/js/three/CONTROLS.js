
import env from '../env.js'
// import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js'
import { 
	OrbitControls 
} from './myOrbitControls.js'
import GLOBAL from '../GLOBAL.js'
import CAMERA from './CAMERA.js'
import RENDERER from './RENDERER.js'

let controls = false

export default (function (){

	if( controls ) return controls

	if( typeof( OrbitControls ) != 'undefined' ){
		controls = new OrbitControls( CAMERA, RENDERER.domElement )
		controls.enablePan = false
		controls.minDistance = GLOBAL.MIN_CAM
		controls.maxDistance = GLOBAL.MAX_CAM

		controls.maxPolarAngle = Math.PI / 2
		controls.minPolarAngle = 0

	}

	return controls

})()
