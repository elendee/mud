import * as lib from '../lib.js'

import SCENE from '../three/SCENE.js'
import MAP from '../MAP.js'

import Flora from './env/Flora.js'
import Structure from './env/Structure.js'

import {
	// Geometry,
	// Vector3,
	// Quaternion,
	PlaneBufferGeometry,
	// BoxBufferGeometry,
	// BoxGeometry,
	MeshLambertMaterial,
	// DoubleSide,
	Mesh,
	InstancedMesh,
	// Object3D,
	Matrix4,
	// Color,
	// ShaderMaterial
} from '../lib/three.module.js'

import texLoader from '../three/texLoader.js'

const ground = texLoader.load('/resource/textures/grass2.jpg')



async function zone_render ( zone, zone_data ){



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

	await instantiate_instanced_meshes()



	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// flora

	await prototype_entities( zone, 'flora', zone_data )	

	instantiate_entities( zone, zone.FLORA, zone_data._FLORA, Flora )




	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// structures

	await prototype_entities( zone, 'structures', zone_data )	

	instantiate_entities( zone, zone.STRUCTURES, zone_data._STRUCTURES, Structure )




	// await prototype_entities( zone, 'npc', zone_data )	

	// instantiate_entities( zone.NPCS, zone_data._NPCS, Npc )


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// npc

	// for( const mud_id of Object.keys( zone_data._NPCS ) ){
	// 	const npc = new Npc( zone_data._NPCS[ mud_id ] )
	// 	zone.NPCS[ mud_id ] = npc
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







async function instantiate_instanced_meshes(){
	// instanced meshes
	// const uniforms = SHADERS.uniforms
	const rocks = new Array(1000)
	const rock_group = await lib.load('obj', '/resource/geometries/rock.obj')

	// const shrub_material = new ShaderMaterial({
	// 	uniforms: SHADERS.uniforms,
	// 	fragmentShader: SHADERS.baseFragmentShader(),
	// 	vertexShader: SHADERS.baseVertexShader(),
	// })
	const rock_material = new MeshLambertMaterial({
		// color: 'rgb(' + Math.floor( Math.random() * 40 ) + ', 60, 20)',
		// color: uniforms.colorB.value
		color: 'rgb( 43, 45, 40)',
	})

	const matrix = new Matrix4()
	const rocks_mesh = new InstancedMesh( rock_group.children[0].geometry, rock_material, rocks.length )
	// const rocks = new InstancedMesh( double, rock_material, shrubs.length )
	rocks_mesh.castShadow = true
	rocks_mesh.receiveShadow = true
	rocks_mesh.userData.clickable = true
	rocks_mesh.userData.type = 'flora'
	rocks_mesh.userData.subtype = 'foliage'
	for( let i = 0; i < rocks.length; i++ ){
		lib.randomize_matrix( matrix, {
			position: MAP.ZONE_WIDTH,
			init_scale: .7,
			scale_range: .5,
			exclude: {
				rotation: {},
				position: {}
			}
		}, 'blorb' )
		rocks_mesh.setMatrixAt( i, matrix )
	}

	const plainsgrass = new Array(500)
	const plainsgrass_group = await lib.load('obj', '/resource/geometries/plainsgrass.obj')

	// const plainsgrass_material = new ShaderMaterial({
	// 	uniforms: SHADERS.uniforms,
	// 	fragmentShader: SHADERS.baseFragmentShader(),
	// 	vertexShader: SHADERS.baseVertexShader(),
	// })
	const plainsgrass_material = new MeshLambertMaterial({
		// color: 'rgb(' + Math.floor( Math.random() * 40 ) + ', 60, 20)',
		// color: uniforms.colorB.value
		color: 'rgb( 83, 95, 40)',
	})

	const plainsgrass_mesh = new InstancedMesh( plainsgrass_group.children[0].geometry, plainsgrass_material, plainsgrass.length )
	// const plainsgrass_mesh = new InstancedMesh( double, plainsgrass_material, plainsgrass.length )
	plainsgrass_mesh.castShadow = true
	plainsgrass_mesh.receiveShadow = true
	plainsgrass_mesh.userData.clickable = true
	plainsgrass_mesh.userData.type = 'flora'
	plainsgrass_mesh.userData.subtype = 'foliage'
	for( let i = 0; i < plainsgrass.length; i++ ){
		lib.randomize_matrix( matrix, {
			position: MAP.ZONE_WIDTH,
			init_scale: 4,
			scale_range: 1,
			exclude: {
				rotation:{
					x: true,
					z: true
				},
				position: {
					y: true
				}
			}
		}, 'blorb' )
		plainsgrass_mesh.setMatrixAt( i, matrix )
	}

	SCENE.add( plainsgrass_mesh )
	SCENE.add( rocks_mesh )
}





async function prototype_entities( zone, type, zone_data ){

	// const zone = this

	const model_inits = []
	let entity, entity_address, base_class, group, color

	switch( type ){

		case 'flora':

			base_class = Flora

			group = zone_data._FLORA

			color = 'rgb(10, 20, 5)'

			break;

		case 'structures':

			base_class = Structure

			group = zone_data._STRUCTURES

			color = 'rgb(65, 55, 45)'

			break;

		default: break;

	}

	for( const mud_id of Object.keys( group ) ){

		entity = group[ mud_id ]

		if( entity.subtype ){

			entity_address = entity.type + '_' + entity.subtype

			if( !zone.model_map[ entity_address ] ){

				zone.model_map[ entity_address ] = 'awaiting'

				if( !zone.material_map[ entity_address ] ){

					// zone.material_map[ entity_address ] = new ShaderMaterial({
					// 	uniforms: SHADERS.uniforms,
					// 	fragmentShader: SHADERS.sampleFragment(),
					// 	vertexShader: SHADERS.baseVertexShader(),
					// 	// clipping: true,
					// 	// lights: true
					// })
					if( entity.type === 'flora' ){
						if( entity.subtype === 'oak' ){
							color  = 'rgb( 18, 20, 5)'
						}else if( entity.subtype === 'pine' ){
							color = 'rgb(10, 20, 5)'
						}
					}

					zone.material_map[ entity_address ] = new MeshLambertMaterial({
						color: color
					})

				}

				const one_time_model = new base_class( entity )
				model_inits.push( one_time_model.proto({
						model_map: zone.model_map,
						address: entity_address
						// prototype_mesh: zone.model_map[ entity_address ]
					}) 
				)

			}

		}

	}

	// const meshes = 
	await Promise.all( model_inits )

	return true

}




async function instantiate_entities( zone, dest_group, source_group, base_class ){

	// if( !this.count )  this.count = 0

	for( const mud_id of Object.keys( source_group )){

		// this.count++

		// if( this.count >  50 ) return true

		const entity = new base_class( source_group[ mud_id ])

		const model_key = entity.type + '_' + entity.subtype

		let proto_mesh = zone.model_map[ model_key ]
		let proto_material = zone.material_map[ model_key ]

		if( proto_mesh ){

			entity.model({ 
				proto_mesh: proto_mesh,
				proto_material: proto_material
			})

		}else{
			console.log('no mesh found for: ', model_key )
		}

		dest_group[ entity.mud_id ] = entity

		if( !entity.MODEL ){
			console.log('failed to make model: ', lib.identify( entity ))
			return false
		}

		entity.MODEL.position.set( entity.ref.position.x, entity.ref.position.y, entity.ref.position.z )

		if( entity.type === 'structure' ){
			console.log( entity.ref.position )
		}

		SCENE.add( entity.MODEL )

	}

}



export{
	zone_render	
}  

