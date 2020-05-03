import GLOBAL from '../../GLOBAL.js'

// import { 
	// CylinderBufferGeometry,
	// MeshBasicMaterial,
	// MeshLambertMaterial,
	// Mesh,
	// DoubleSide,
	// PlaneBufferGeometry
	// Vector3,
	// Group,
	// SpriteMaterial,
	// Sprite,
	// RepeatWrapping
// } from '../../lib/three.module.js'

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








export default class Flora {

	constructor( init ){

		init = init || {}

		this.mud_id = init.mud_id

		this.type = init.type

		this.x = typeof( init.x ) === 'number' ? init.x : init._x
		this.y = typeof( init.y ) === 'number' ? init.y : init._y
		this.z = typeof( init.z ) === 'number' ? init.z : init._z

		this.MODEL = false

	}

	model(){

		const flora = this

		return new Promise((resolve, reject) => {

			GLTF.load( '/resource/geometries/mypine.glb',

				( obj ) => {

					// console.log( obj.scene.children[0].geometry )

					flora.MODEL = obj.scene

					// console.log( flora.MODEL )

					// tree.MODEL.position.copy( tree.ref.position )

					// tree.MODEL.scale.multiplyScalar( .8 + Math.random() )

					for( const child of flora.MODEL.children ){
						child.castShadow = true
						child.material.color.set('rgb(' + Math.floor( Math.random() * 100 ) + ',200,' + Math.floor( Math.random() * 100 ) + ')')
					}

					resolve()

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



