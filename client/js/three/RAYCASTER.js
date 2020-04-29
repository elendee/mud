import { Raycaster } from '../lib/three.module.js'
import env from '../env.js'

let raycaster = false

// function init()
export default (function(){

	if(raycaster) return raycaster

	raycaster = new Raycaster(); 

	return raycaster

})()

// export { init }