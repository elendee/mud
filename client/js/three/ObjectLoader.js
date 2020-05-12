import {
	ObjectLoader
} from '../lib/three.module.js'

let objloader = false

export default (function(){

	if( objloader ) return objloader

	objloader = new ObjectLoader()

	return objloader

})()