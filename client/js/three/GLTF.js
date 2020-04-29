// import {
// 	TextureLoader
// } from '../lib/three.module.js'
import {
	GLTFLoader
} from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'

let gltf = false

export default (function(){

	if( gltf ) return gltf

	gltf = new GLTFLoader()

	return gltf

})()