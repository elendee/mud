import {
	BufferGeometryLoader
} from '../lib/three.module.js'

let bgl = false

export default (function(){

	if( bgl ) return bgl

	bgl = new BufferGeometryLoader()

	return bgl

})()