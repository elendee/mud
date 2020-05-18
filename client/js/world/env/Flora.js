import GLOBAL from '../../GLOBAL.js'

import * as lib from '../../lib.js'

import Clickable from '../Clickable.js'

import { 
	// CylinderBufferGeometry,
	// MeshBasicMaterial,
	// MeshLambertMaterial,
	Mesh,
	// DoubleSide,
	// PlaneBufferGeometry
	// Vector3,
	// Group,
	// SpriteMaterial,
	// Sprite,
	// RepeatWrapping
} from '../../lib/three.module.js'

// import Loader from '../../three/texLoader.js'
import GLTF from '../../three/GLTF.js'
import BuffGeoLoader from '../../three/BuffGeoLoader.js'
import ObjectLoader from '../../three/ObjectLoader.js'


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

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

		// this.mud_id = init.mud_id

		// this.type = init.type

		// this.x = typeof( init.x ) === 'number' ? init.x : init._x
		// this.y = typeof( init.y ) === 'number' ? init.y : init._y
		// this.z = typeof( init.z ) === 'number' ? init.z : init._z

		this.MODEL = false

	}

	async model( init ){

		if( init.mesh ){ // already instantiated

			if( init.mesh.isMesh ){ 

				this.MODEL = init.mesh.clone()

				return true

			}else if( init.mesh.isScene ){

				this.MODEL = init.mesh.clone()
				this.MODEL.receiveShadow = true
				this.MODEL.castShadow = true
				this.MODEL.rotation.y += Math.random()
				this.MODEL.traverse(( object )=>{
					if( object.isMesh ){
						object.material = init.material
						// object.material.color.set('blue') // affects all..
						object.receiveShadow = true
						object.castShadow = true
					}
				})

			}else{
				console.log('invalid mesh passed.....', init.mesh )
			}

			if( this.MODEL ){
				this.MODEL.userData = new Clickable( this )
			}

		}else if( init.map ){ // instantiating the prototype

			const flora = this

			const url = '/resource/geometries/' + lib.identify( this ) + '.json'

			const scene = await lib.load('json', url )

			init.map[ this.type + '_' + this.subtype ] = scene

			return true

		}
		
	}

}



