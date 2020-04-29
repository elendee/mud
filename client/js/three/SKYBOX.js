
import env from '../env.js'
import GLOBAL from '../GLOBAL.js'

import { 
	MeshBasicMaterial, 
	BackSide, 
	CubeGeometry, 
	TextureLoader,
	Mesh
} from '../lib/three.module.js'



import SCENE from './SCENE.js'

let skyBox = false

export default (function(){

	if(skyBox) return skyBox

	// const box_img = '/resource/textures/skybox/bluecloud_'

	const directions  = ['ft', 'bk', 'up', 'dn', 'rt', 'lt']

	let skyGeometry = new CubeGeometry( GLOBAL.SKY_WIDTH, GLOBAL.SKY_WIDTH, GLOBAL.SKY_WIDTH )	
	let materialArray = new Array(6)

	const loader = new TextureLoader()
		
	for(let i=0;i<6;i++){
		loader.load( '/resource/textures/skybox/starfield.jpg', function(tex){
		// loader.load( box_img + directions[i] + '.jpg', function(tex){
			materialArray[i] =  new MeshBasicMaterial({
				map: tex,
				side: BackSide,
				fog: false
			})		
		} )
	}
		
	skyBox = new Mesh( skyGeometry, materialArray )

	return skyBox

})()