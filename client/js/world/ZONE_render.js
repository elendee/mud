import * as lib from '../lib.js'
import env from '../env.js'

import SCENE from '../three/SCENE.js'
import MAP from '../MAP.js'

import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'

import {
	// Geometry,
	// Vector3,
	// Quaternion,
	PlaneBufferGeometry,
	// BoxBufferGeometry,
	// BoxGeometry,
	MeshLambertMaterial,
	DoubleSide,
	Mesh,
	InstancedMesh,
	// Object3D,
	Matrix4,
	// Color,
	// ShaderMaterial
} from '../lib/three.module.js'

import texLoader from '../three/texLoader.js'

const ground = texLoader.load('/resource/textures/grass2.jpg')
const path_map = texLoader.load('/resource/textures/path.png')



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

	// moved to wss

	// await prototype_entities( zone, 'flora', zone_data )	

	// zone.instantiate_entities( 'FLORA', zone_data._FLORA, Flora )




	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// structures

	// moved to wss

	// await prototype_entities( zone, 'structures', zone_data )	

	// zone.instantiate_entities( 'STRUCTURES', zone_data._STRUCTURES, Structure )




	// await prototype_entities( zone, 'npc', zone_data )	

	// zone.instantiate_entities( zone.NPCS, zone_data._NPCS, Npc )


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

    if( env.LOCAL && 0 ){
		setTimeout(function(){
			CAMERA.offset.set( -50, 50, 50 )
			CAMERA.position.copy( window.TOON.BBOX.position ).add( CAMERA.offset )
			CAMERA.lookAt( window.TOON.BBOX.position )
			RENDERER.frame( SCENE )
		}, 1000)
	}

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



function render_paths(){

	// console.log('rendering')

	const path_geo = new PlaneBufferGeometry( 100, 360, 1 )
	const path_mat = new MeshLambertMaterial({
		map: path_map,
		side: DoubleSide,
		transparent: true,
		opacity: .3,
	})

	const paths = window.paths = []

	for( let i = 0; i < 4; i++ ){
		paths[i] = new Mesh( path_geo, path_mat )
		paths[i].rotation.x = -Math.PI / 2
		paths[i].position.y = 1
		SCENE.add( paths[i] )
	}

	paths[0].position.x = 0 
	paths[0].position.z = 500 
	paths[0].rotation.z = -Math.PI / 2

	paths[1].position.x = 500 
	paths[1].position.z = 0 
	paths[1].rotation.z = Math.PI
	
	paths[2].position.x = 1000 
	paths[2].position.z = 500 
	paths[2].rotation.z = Math.PI / 2
	
	paths[3].position.x = 500 
	paths[3].position.z = 1000 
	// paths[3].rotation.z = -Math.PI

}


render_paths()












export{
	zone_render
}  

