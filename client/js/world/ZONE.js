import * as lib from '../lib.js'
import env from '../env.js'

import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'
import * as LIGHT from '../three/LIGHT.js'

import * as SHADERS from './env/shaders.js'

import GLOBAL from '../GLOBAL.js'
import TOONS from './TOONS.js'

import Toon from './Toon.js'

// import BuffGeoLoader from '../three/BuffGeoLoader.js'

import Flora from './env/Flora.js'
// import Npc from './Npc.js'
import grass_mesh from './env/grass_mesh.js'

import * as KEYS from './ui/KEYS.js'
import * as MOUSE from './ui/MOUSE.js'
import CHAT from './ui/CHAT.js'

// import DIALOGUE from './'

import * as ANIMATE from './animate.js'

import {
	Geometry,
	Vector3,
	Quaternion,
	PlaneBufferGeometry,
	BoxBufferGeometry,
	BoxGeometry,
	MeshLambertMaterial,
	DoubleSide,
	Mesh,
	InstancedMesh,
	Object3D,
	Matrix4,
	Color,
	ShaderMaterial
} from '../lib/three.module.js'


import texLoader from '../three/texLoader.js'

if( env.EXPOSE ){
	window.SCENE = SCENE
}



let new_pos, new_quat, old_pos, old_quat, needs_move, needs_rotate

const ground = texLoader.load('/resource/textures/grass2.jpg')


class Zone {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init )){
			this[ key ] = init[ key ]
		}

		this.intervals = {
			anim_sweeper: false
		}

		this.FLORA = {}
		this.STRUCTURES = {}
		this.NPCS = {}
		this.TOONS = {}

		this.model_map = []
		this.material_map = []

	}

	initialize(){

		KEYS.init( this )
		MOUSE.init( this )
		CHAT.init()
		// DIALOGUE.init()

		const TOON = window.TOON

		TOON.model('self')

		this.TOONS[ TOON.mud_id ] = TOON

		// TOON.MODEL.position.set( 
		// 	TOON.ref.position.x + Math.floor( Math.random() * 10 ), 
		// 	TOON.height / 2, 
		// 	TOON.ref.position.z + Math.floor( Math.random() * 10 )
		// )

		// TOON.MODEL.position.set( 0, 0, 0 )

		// TOON.MODEL.add( LIGHT.spotlight )
		SCENE.add( LIGHT.hemispherical )
		// SCENE.add( LIGHT.spotlight )
		SCENE.add( LIGHT.directional )
		// LIGHT.directional.position.set( MAP.ZONE_WIDTH * .66, 100, MAP.ZONE_WIDTH * .66 )
		LIGHT.directional.position.set( 
			MAP.ZONE_WIDTH * 1.2, 
			400, 
			MAP.ZONE_WIDTH * 1.2 
		)

		const ltarget = new Object3D()
		ltarget.position.set( MAP.ZONE_WIDTH / 2 , 0, MAP.ZONE_WIDTH / 2 )
		SCENE.add( ltarget )
		LIGHT.directional.target = ltarget

		// LIGHT.spotlight.target = TOON.MODEL
		TOON.MODEL.position.copy( TOON.ref.position )

		TOON.MODEL.position.y = lib.get_dimensions( TOON.MODEL ).y / 2

		SCENE.add( TOON.MODEL )

		// console.log( lib.get_dimensions( TOON.MODEL ) )
		// SCENE.add( LIGHT.helper )

		// les get dat Y attr ------------------------------

		// TOON.MODEL.position.copy( TOON.ref.position )

		LIGHT.helper.position.copy( TOON.MODEL.position )

		// TOON.HEAD.add( CAMERA )
		// TOON.MODEL.add( CAMERA )
		SCENE.add( CAMERA )
	    CAMERA.position.copy( window.TOON.MODEL.position ).add( CAMERA.offset )

	    if( env.LOCAL && 0 ){
			setTimeout(function(){
				CAMERA.offset.set( -50, 50, 50 )
				CAMERA.position.copy( window.TOON.MODEL.position ).add( CAMERA.offset )
				CAMERA.lookAt( window.TOON.MODEL.position )
				RENDERER.frame( SCENE )
			}, 1000)
		}
		// CAMERA.position.set( 0, 150, 20 )



		setTimeout(function(){

			CAMERA.lookAt( TOON.MODEL.position ) 

			RENDERER.frame( SCENE )

		}, 100 )

		TOON.begin_intervals()

		this.begin_intervals()

		CHAT.begin_pulse()

		if( env.EXPOSE ) window.CAMERA = CAMERA

	}














	async render( zone_data ){





		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// tiles

		const geometry = new PlaneBufferGeometry( MAP.TILE_WIDTH, MAP.TILE_WIDTH, 32 )
		const material = new MeshLambertMaterial({
			color: 0xaaaa88,
			// color: 0x443333, 
			map: ground,
			// side: DoubleSide 
		})

		let tile
		let width = Math.ceil( MAP.ZONE_WIDTH / MAP.TILE_WIDTH ) + 2
		let height = Math.ceil( MAP.ZONE_WIDTH / MAP.TILE_WIDTH ) + 2

		for( let x = -2; x < width; x++ ){
			for( let z = -2; z < height; z++ ){
				
				const ground = new Mesh( geometry, material )
				ground.receiveShadow = true
				ground.rotation.x = -Math.PI / 2
				ground.position.set( x * MAP.TILE_WIDTH + ( 0 ), .1, z * MAP.TILE_WIDTH  + ( 0 ))
				SCENE.add( ground )

			}
		}





		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// foliage

		await this.instantiate_instanced_meshes()



		
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// flora

		await this.create_entity_prototypes('flora', zone_data )	

		this.instantiate_entities( this.FLORA, zone_data._FLORA, Flora )

		// await this.create_entity_prototypes('npc', zone_data )	

		// this.instantiate_entities( this.NPCS, zone_data._NPCS, Npc )


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// npc

		// for( const mud_id of Object.keys( zone_data._NPCS ) ){
		// 	const npc = new Npc( zone_data._NPCS[ mud_id ] )
		// 	this.NPCS[ mud_id ] = npc
		// 	// console.log('placing: ', npc )
		// 	npc.model()
		// 	.then(res=>{
		// 		npc.MODEL.position.set(
		// 			npc.x,
		// 			npc.y,
		// 			npc.z,
		// 		)
		// 		npc.MODEL.userData = {
		// 			clickable: true,
		// 			type: 'npc',
		// 			mud_id: mud_id
		// 		}
		// 		SCENE.add( npc.MODEL )
		// 	}).catch(err=>{
		// 		console.log('err npc load: ', err )
		// 	})			
		// }

	}




	async instantiate_instanced_meshes(){
		// instanced meshes
		// shrubs
		const uniforms = SHADERS.uniforms
		const shrubs = new Array(2000)
		const shrub_geometry = await lib.load('buffer_geometry', '/resource/geometries/pine-piece.json')
		// const shrub_material = new ShaderMaterial({
		// 	uniforms: SHADERS.uniforms,
		// 	fragmentShader: SHADERS.baseFragmentShader(),
		// 	// vertexShader: SHADERS.baseVertexShader(),
		// })
		const shrub_material = new MeshLambertMaterial({
			// color: 'rgb(' + Math.floor( Math.random() * 40 ) + ', 60, 20)',
			color: 'rgb( 60, 60, 20)',
			// color: uniforms.colorB.value
		})
		// const shrub_material = new ShaderMaterial({
		// 	uniforms: uniforms,
		// 	// vertexShader: vertexShader(),
		// 	fragmentShader: fragmentShader()
		// })
		const matrix = new Matrix4()
		const shrubberies = new InstancedMesh( shrub_geometry, shrub_material, shrubs.length )
		shrubberies.castShadow = true
		shrubberies.userData.clickable = true
		shrubberies.userData.type = 'flora'
		shrubberies.userData.subtype = 'foliage'
		for( let i = 0; i < shrubs.length; i++ ){
			lib.randomize_matrix( matrix, {
				position: MAP.ZONE_WIDTH,
				scale: .7,
				exclude: {
					y: true
				}
			}, 'blorb' )
			shrubberies.setMatrixAt( i, matrix )
		}
		SCENE.add( shrubberies )
	}





	async create_entity_prototypes( type, zone_data ){

		const zone = this

		const model_inits = []
		let entity, entity_address

		switch( type ){

			case 'flora':

				for( const mud_id of Object.keys( zone_data._FLORA ) ){

					entity = zone_data._FLORA[ mud_id ]

					if( entity.subtype ){

						entity_address = entity.type + '_' + entity.subtype

						if( !zone.model_map[ entity_address ] ){

							zone.model_map[ entity_address ] = 'awaiting'

							const one_time_model = new Flora( entity )
							model_inits.push( one_time_model.model({
									map: zone.model_map 
								}) 
							)

						}

						if( !zone.material_map[ entity_address ] ){

							zone.material_map[ entity_address ] = new ShaderMaterial({
								uniforms: SHADERS.uniforms,
								fragmentShader: SHADERS.sampleFragment(),
								vertexShader: SHADERS.baseVertexShader(),
							})

							// zone.material_map[ entity_address ] = new MeshLambertMaterial({
							// 	color: 'rgb(10, 20, 5)'
							// })

						}

					}

				}

				// const meshes = 
				await Promise.all( model_inits )

				return true

				break;

			default: break;

		}

	}




	instantiate_entities( dest_group, source_group, base_class ){

		for( const mud_id of Object.keys( source_group )){

			const entity = new base_class( source_group[ mud_id ])

			const model_key = entity.type + '_' + entity.subtype

			let this_mesh = this.model_map[ model_key ]
			let this_material = this.material_map[ model_key ]

			if( this_mesh || mesh ){
				entity.model({
					mesh: this_mesh,
					material: this_material
				})
				.catch( err => { console.log('err cloning mesh: ', err ) })
			}

			dest_group[ entity.mud_id ] = entity

			entity.MODEL.position.set( entity.ref.position.x, entity.ref.position.y, entity.ref.position.z )

			SCENE.add( entity.MODEL )

		}
	}







	begin_intervals(){

		this.intervals.anim_sweeper = setInterval(function(){

			for( const mud_id of ANIMATE.moving_toons ){
				if( !TOONS[ mud_id ]) ANIMATE.moving_toons.splice( ANIMATE.moving_toons.indexOf( mud_id ), 1 )
			}
			for( const mud_id of ANIMATE.rotating_toons ){
				if( !TOONS[ mud_id ]) ANIMATE.rotating_toons.splice( ANIMATE.rotating_toons.indexOf( mud_id ), 1 )
			}

		}, 10000 )

		if( env.LOCAL ){

			this.intervals.dev = setInterval(function(){

				SOCKET.send(JSON.stringify({
					type: 'dev_ping'
				}))

			}, 2000 )

		}

	}






	handle_move( packet ){

		for( const mud_id of Object.keys( packet ) ){

			if( window.TOON.mud_id !== mud_id ){

				if( !TOONS[ mud_id ] ){

					console.log('requesting: ', mud_id )

					window.SOCKET.send(JSON.stringify({
						type: 'toon_ping',
						mud_id: mud_id
					}))

				}else{

					// console.log('updating patron pos: ', mud_id )
					needs_move = needs_rotate = false

					// if( !TOONS[ mud_id ] ) console.log('wtf: ', TOONS[ mud_id ] )
					new_pos = packet[ mud_id ].position
					new_quat = packet[ mud_id ].quaternion
					old_pos = TOONS[ mud_id ].ref.position
					old_quat = TOONS[ mud_id ].ref.quaternion

					if( new_pos.x !== old_pos.x || new_pos.y !== old_pos.y || new_pos.z !== old_pos.z )  needs_move = true
					if( new_quat._x !== old_quat._x || new_quat._y !== old_quat._y || new_quat._z !== old_quat._z || new_quat._w !== old_quat._w )  needs_rotate = true

					if( needs_move ){

						old_pos.set(
							new_pos.x,
							new_pos.y,
							new_pos.z
						)
						// old_pos.x = new_pos.x
						// old_pos.y = new_pos.y
						// old_pos.z = new_pos.z

					}

					if( needs_rotate ){

						// old_quat = new Quaternion( 
						old_quat.set( 
							new_quat._x,
							new_quat._y,
							new_quat._z,
							new_quat._w
						)

					}

					if( needs_move ) ANIMATE.receive_move()
					if( needs_rotate ) ANIMATE.receive_rotate()

					TOONS[ mud_id ].needs_move = needs_move
					TOONS[ mud_id ].needs_rotate = Number( needs_rotate ) * 400

				}

			}else{

				// console.log('skipping self data in move pulse')

			}

		}

	}


	touch_toon( packet ){

		if( packet.toon ){
			if( TOONS[ packet.toon.mud_id ] ){
				// update
			}else{
				TOONS[ packet.toon.mud_id ] = new Toon( packet.toon )
				TOONS[ packet.toon.mud_id ].model()
				SCENE.add( TOONS[ packet.toon.mud_id ].MODEL )
				TOONS[ packet.toon.mud_id ].MODEL.position.set(
					TOONS[ packet.toon.mud_id ].ref.position.x,
					TOONS[ packet.toon.mud_id ].ref.position.y,
					TOONS[ packet.toon.mud_id ].ref.position.z
				)

				RENDERER.frame( SCENE )

			}
		}

	}


}





let zone = false

export default (function(){
	if( zone ) return zone
	zone = new Zone()
	return zone
})();

