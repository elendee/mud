// import {
// 	TextureLoader
// } from '../lib/three.module.js'
import {
	OBJLoader
} from '../lib/OBJLoader.js'

let obj = false

export default (function(){

	if( obj ) return obj

	obj = new OBJLoader()

	return obj

})()