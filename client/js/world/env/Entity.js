
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
		// proto_map
		// model_type
		// address
 
		// const url = '/resource/geometries/' + lib.identify( this ) + '.json'
		const url = '/resource/geometries/' + lib.identify( 'model', this ) + '.' + init.proto_map[ init.address ].type

		// console.log( 'proto: ' + lib.identify( false, this ) + '.' + init.proto_map[ init.address ] )

		// const scene = await lib.load('json', url )
		const group = await lib.load( init.proto_map[ init.address ].type, url )

		// console.log('group: ', group)

		let mesh 
		if( init.proto_map[ init.address ].type === 'obj' ) mesh = group.children[0]
		if( init.proto_map[ init.address ].type === 'glb' ) mesh = group.scene

		if( !mesh ){
			console.log('invalid obj prototype requested: ', lib.identify( 'generic', this ) )
			return false
		}
		if( init.proto_map[ init.address ].type === 'glb' ){
			for( const child of mesh.children ){
				console.log('name: ', child.name )
				if( child.name.match(/_cs_/)){
					child.castShadow = true
				}
			}
		}
		mesh.castShadow = true
		mesh.receiveShadow = true

		init.proto_map[ init.address ].model = mesh

		return true

	}

	model( init ){
		// address
		// proto_map
		let proto = init.proto_map[ init.address ]
		// let key = init.address

		// if( key.match(/blacksmith/)){
		// 	console.log("model: ", proto, key )

		// }

		if( proto.model.isMesh || proto.model.isGroup ){ 

			this.MODEL = proto.model.clone()
			if( proto.type === 'obj' && proto.material )  this.MODEL.material = proto.material
			// if( init.this.MODEL.material = init.proto_material
			this.inflate()

			this.MODEL.userData = new Clickable( this )

		}else if( proto.model.isScene ){

			console.log( 'bad, collapse to object, ', lib.identify( 'generic', this ) )

		// }
		// else if( proto.model.isGroup ){

		// 	this.MODEL = proto.model.clone()

		// 	this.inflate()



		}else{
			console.log('invalid mesh passed.....', init )
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