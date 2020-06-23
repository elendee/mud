

import GLOBAL from '../../GLOBAL.js'

import * as lib from '../../lib.js'

import Clickable from '../Clickable.js'

import { dirt } from '../../three/GROUND.js'
import RENDERER from '../../three/RENDERER.js'
import SCENE from '../../three/SCENE.js'


import { 
	// CylinderBufferGeometry,
	MeshBasicMaterial,
	MeshLambertMaterial,
	Mesh,
	Box3,
	BoxBufferGeometry,
	// DoubleSide,
	// PlaneBufferGeometry
	Vector3,
	// Group,
	// SpriteMaterial,
	// Sprite,
	// RepeatWrapping
} from '../../lib/three.module.js'

import gltfLoader from '../../three/loader_GLTF.js'




export default class Entity {

	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

		this.MODEL = false
		this.BBOX = false

		this.logistic = []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('MODEL', 'BBOX', 'orientation')

	}

	

	async model( proto_map, add_to_scene ){
		// address
		// proto_map

		// console.log('model entity: ', init )
		const entity = this

		const entity_address = lib.identify('model', this )

		if( proto_map[ entity_address ] ){

			if( !proto_map[ entity_address ].isMesh && !proto_map[ entity_address ].isGroup ){
				console.log('invalid proto: ', entity_address, proto_map[ entity_address ])
				return false
			}

			entity.MODEL = proto_map[ entity_address ].clone()

		}else{

			console.log('prototyping: ', entity_address )

			const model = await entity.retrieve()

			proto_map[ entity_address ] = model.scene
			entity.MODEL = model.scene

			// const bbox = new Box3().setFromObject( toon.MODEL ).getSize()
			// const bbox_geo = new BoxBufferGeometry( bbox.x, bbox.y, bbox.z )
			// toon.BBOX = new Mesh( bbox_geo, lib.materials.transparent )
			// const bbox_source = new Box3().setFromObject( source_mesh ).getSize()

		}

		entity.inflate()

		const bbox = new Box3().setFromObject( entity.MODEL ).getSize()
		const bbox_geo = new BoxBufferGeometry( bbox.x, bbox.y, bbox.z )
		entity.BBOX = new Mesh( bbox_geo, lib.materials.transparent )

		entity.BBOX.add( entity.MODEL )

		entity.MODEL.traverse(function( ele ){
			if( ele.name.match(/_cs_/)){
				ele.castShadow = true
			}
			if( ele.name.match(/_rs_/)){
				ele.receiveShadow = true
			}
			if( ele.name.match(/HEAD/)){
				this.MODEL.HEAD = ele
			}
			if( ele.name.match(/_mat/)){
				let slug = ele.name.substr( ele.name.indexOf('_mat') + 5 ).replace(/_.*/g, '')
				if( lib.materials[ slug ] ){
					ele.material = lib.materials[ slug ]
				}else{
					console.log('missing material: ', slug )
				}
			}
		})

		entity.MODEL.userData = new Clickable( entity )

		if( entity.type === 'structure' ){

			entity.BBOX.rotation.y = Number( entity.orientation ) || 0

			const structure_dirt = dirt.clone()
			const bbox_source = new Box3().setFromObject( entity.BBOX ).getSize()

			structure_dirt.scale.x = ( bbox_source.x / 10 ) * 1.2 // 10 == standard size..
			structure_dirt.scale.y = ( bbox_source.z  / 10 ) * 1.2

			structure_dirt.position.copy( entity.BBOX.position )
			structure_dirt.position.y += 1
			structure_dirt.receiveShadow = true
			structure_dirt.rotation.z = this.orientation

			if( add_to_scene )  this.BBOX.add( structure_dirt )

		}
		

		if( add_to_scene ){

			this.BBOX.position.set( this.ref.position.x, this.ref.position.y, this.ref.position.z )
			SCENE.add( this.BBOX )

			RENDERER.frame( SCENE )

		}

		return true

	}



	inflate(){

		// const bbox = new Vector3()
		// new Box3().setFromObject( this.MODEL ).getSize( bbox )
		const bbox = new Box3().setFromObject( this.MODEL ).getSize()

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

		// const bbox = new Box3().setFromObject( this.MODEL ).getSize()
		const bbox_geo = new BoxBufferGeometry( bbox.x, bbox.y, bbox.z )
		this.BBOX = new Mesh( bbox_geo, lib.materials.transparent )


		// rotation

		// grr, bends target reticule into ground ..
		// if( this.subtype === 'pine' )  this.MODEL.rotation.z += Math.random() * .3 

	}



	retrieve(){

		const entity = this

		return new Promise((resolve, reject) => {

			const slug = lib.identify( 'model', entity )

			const url  = '/resource/geometries/' + slug + '.glb' // + type

			gltfLoader.load(
				url,
				function ( model ) {

					resolve( model )

					// gltf.animations; // Array<THREE.AnimationClip>
					// gltf.scene; // THREE.Group
					// gltf.scenes; // Array<THREE.Group>
					// gltf.cameras; // Array<THREE.Camera>
					// gltf.asset; // Object
				},
				function ( xhr ) {
					// console.log( slug + ' ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
				},
				function ( error ) {
					reject( error )
				}
			)

		})

	}

}