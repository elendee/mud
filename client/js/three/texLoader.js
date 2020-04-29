import {
	TextureLoader
} from '../lib/three.module.js'


let texloader = false

export default (function(){

	if( texloader ) return texloader

	texloader = new TextureLoader()

	return texloader

})()