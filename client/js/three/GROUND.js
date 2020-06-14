
import {
	BoxBufferGeometry,
	PlaneBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	DoubleSide,
	// Group,
} from '../lib/three.module.js'


import texLoader from './texLoader.js'

let ground = false

const dirt_map = texLoader.load('/resource/textures/dirt.png')

const ground_geo = new PlaneBufferGeometry( 10, 10, 10 )
// const ground_geo = new BoxBufferGeometry( 10, 10, 1 )
const ground_mat = new MeshLambertMaterial({
	map: dirt_map,
	// color: 'red',
	side: DoubleSide,
	transparent: true,
})
const dirt = new Mesh( ground_geo, ground_mat )
dirt.rotation.x = Math.PI / 2
// dirt.rotation.x = 1





// export default (function(){

// 	if( ground ) return ground

// 	// ground = new Group()
	
// 	// let walls = []
// 	// for(let i = 0; i < 4; i++){
// 	const geometry = new PlaneBufferGeometry( 1500, 1500, 32 );
// 	const material = new MeshLambertMaterial( { color: 0xffff00, side: DoubleSide } );
// 	ground = new Mesh( geometry, material );
// 	ground.receiveShadow = true

// 	ground.rotation.x = Math.PI / 2

// 	ground.position.set( 0, 0, 0 )

// 	return ground

// 		// walls[i] = plane
// 	// }

// 	// walls[0].position.x = 500
// 	// walls[0].position.y = 0
// 	// walls[0].rotation.z = Math.PI / 2

// 	// walls[1].position.x = 500
// 	// walls[1].position.y = 500
// 	// walls[1].rotation.z = 0
	
// 	// walls[2].position.x = 500
// 	// walls[2].position.y = 1000
// 	// walls[2].rotation.z = Math.PI / 2
	
// 	// walls[3].position.x = 0
// 	// walls[3].position.y = 500
// 	// walls[3].rotation.z = 0

// })()

export {
	dirt
}