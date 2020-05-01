import GLOBAL from '../../GLOBAL.js'

import { 
	// CylinderBufferGeometry,
	// MeshBasicMaterial,
	MeshLambertMaterial,
	Mesh,
	DoubleSide,
	PlaneBufferGeometry
	// Vector3,
	// Group,
	// SpriteMaterial,
	// Sprite,
	// RepeatWrapping
} from '../../lib/three.module.js'

// import Loader from '../../three/texLoader.js'
import GLTF from '../../three/GLTF.js'


// GLOBALize these:
// const geometries = {
	// tree: new PlaneBufferGeometry( GLOBAL.TREE_BASE, GLOBAL.TREE_BASE )
	// tree: new PlaneBufferGeometry( GLOBAL.TREE_BASE, GLOBAL.TREE_BASE )
// }

// const texture = Loader.load( '/resource/tree1.png' )

// const material = new MeshLambertMaterial({
// 	// color,
// 	map: texture,
// 	// opacity: 0.5,
// 	transparent: true,
// 	side: DoubleSide
// })

let tree_geo 
let tree_mat








export default class Foliage {

	constructor( init ){

		init = init || {}

		this.MODEL = false

	}

	model(){

		const foliage = this

		return new Promise((resolve, reject) => {

			GLTF.load( '/resource/geometries/mypine.glb',

				( obj ) => {

					// console.log( obj.scene.children[0].geometry )

					foliage.MODEL = obj.scene

					// console.log( foliage.MODEL )
					resolve()

					// tree.MODEL.position.copy( tree.ref.position )

					// tree.MODEL.scale.multiplyScalar( .8 + Math.random() )

					for( const child of foliage.MODEL.children ){
						child.castShadow = true
						child.material.color.set('rgb(' + Math.floor( Math.random() * 100 ) + ',200,' + Math.floor( Math.random() * 100 ) + ')')
					}

					// tree.MODEL.userData = {
					// 	clickable: true,
					// 	type: 'tree'
					// }

					// resolve( tree.MODEL )

				}, (xhr) => {

					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )

				}, ( error ) => {

					console.log('err loading model: ', error )

					reject()

				})

			})


		// this.MODEL = new Mesh( geometries.tree, material )
		// this.MODEL.castShadow = true
		// this.MODEL.rotation.x = Math.PI / 2
	}

}



