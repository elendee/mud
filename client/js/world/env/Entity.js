
import GLOBAL from '../../GLOBAL.js'

import * as lib from '../../lib.js'

import Clickable from '../Clickable.js'

import { 
	// CylinderBufferGeometry,
	// MeshBasicMaterial,
	// MeshLambertMaterial,
	Mesh,
	Box3,
	// DoubleSide,
	// PlaneBufferGeometry
	Vector3,
	// Group,
	// SpriteMaterial,
	// Sprite,
	// RepeatWrapping
} from '../../lib/three.module.js'

// import Loader from '../../three/texLoader.js'
// import GLTF from '../../three/GLTF.js'
// import BuffGeoLoader from '../../three/BuffGeoLoader.js'
// import ObjectLoader from '../../three/ObjectLoader.js'

// let tree_geo 
// let tree_mat

export default class Entity {

	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

		this.MODEL = false

	}

	async proto( init ){
 
		// const url = '/resource/geometries/' + lib.identify( this ) + '.json'
		const url = '/resource/geometries/' + lib.identify( 'model', this ) + '.obj'

		console.log( '>>> ' + lib.identify( false, this ) )

		// const scene = await lib.load('json', url )
		const group = await lib.load('obj', url )

		const mesh = group.children[0]

		if( !mesh || !mesh.isMesh ){
			console.log('invalid obj prototype requested: ', lib.identify( 'generic', this ) )
			return false
		}
		mesh.castShadow = true
		mesh.receiveShadow = true

		init.model_map[ init.address ] = mesh

		return true

	}

	model( init ){

		if( init.proto_mesh.isMesh ){ 

			this.MODEL = init.proto_mesh.clone()
			this.MODEL.material = init.proto_material
			this.inflate()

			this.MODEL.userData = new Clickable( this )

		}else if( init.proto_mesh.isScene ){

			console.log( 'bad, collapse to object, ', lib.identify( 'generic', this ) )

		}else{
			console.log('invalid mesh passed.....', init.proto_mesh )
		}

	}


	inflate(){

		const bbox = new Vector3()
		new Box3().setFromObject( this.MODEL ).getSize( bbox )

		const ratio = {
			x: this.width / bbox.x,
			y: this.height / bbox.y,
			z: this.length / bbox.z
		}

		// scale

		if( this.type === 'flora' ){
			ratio.z *= ( bbox.z / bbox.x )
			this.MODEL.rotation.y += Math.random() * Math.PI
		}

		this.MODEL.scale.set( ratio.x, ratio.y, ratio.z )


		// rotation

		// grr, bends target reticule into ground ..
		// if( this.subtype === 'pine' )  this.MODEL.rotation.z += Math.random() * .3 

	}

}