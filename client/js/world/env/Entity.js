
import GLOBAL from '../../GLOBAL.js'

import * as lib from '../../lib.js'

import Clickable from '../Clickable.js'

import { 
	// CylinderBufferGeometry,
	MeshBasicMaterial,
	MeshLambertMaterial,
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

const materials = {
	wooddark: new MeshLambertMaterial({
		color: 'rgb(40, 20, 15)'
	}),
	stonedark: new MeshLambertMaterial({
		color: 'rgb(100, 100, 100)'
	}),
	forge: new MeshLambertMaterial({
		color: 'rgb(10,10,10)'
	}),
	furnace: new MeshBasicMaterial({
		color: 'rgb(255, 185, 50)',
		// emissive: 'rgb(55, 05, 120)'
	})
}

window.materials = materials



export default class Entity {

	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

		this.MODEL = false

		this.logistic = []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('MODEL', 'orientation')

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

			// let mat

			mesh.traverse((ele)=>{
				// if( init.address.match(/blacksmit/) ) console.log('n: ', ele.name )
				if( ele.name.match(/_cs_/)){
					ele.castShadow = true
				}
				if( ele.name.match(/_rs_/)){
					ele.receiveShadow = true
				}
				if( ele.name.match(/_mat/)){
					window[ ele.name ] = ele
					// console.log( ele.name.substr( ele.name.indexOf('_mat') + 4 ) )
					// console.log( 'trying to assign: ', materials[ ele.name.substr( ele.name.indexOf('_mat') + 4 ) ] )
					ele.material = materials[ ele.name.substr( ele.name.indexOf('_mat') + 5 ) ]
					// console.log('mat after: ', ele.material )
				}
			})
			// for( const child of mesh.children ){
			// 	if( child.name.match(/_cs_/)){
			// 		child.castShadow = true
			// 	}
			// }
		}else{ // obj 
			mesh.castShadow = true
			mesh.receiveShadow = true			
		}


		init.proto_map[ init.address ].model = mesh

		return true

	}

	model( init ){
		// address
		// proto_map

		let proto = init.proto_map[ init.address ]

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