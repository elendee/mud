import {
	Vector3,
	Euler,
	Quaternion,
	BufferGeometry,
	Box3
} from './lib/three.module.js'

import GLTF from './three/loader_GLTF.js'
import BuffGeoLoader from './three/loader_BuffGeoLoader.js'
import ObjectLoader from './three/loader_ObjectLoader.js'
import OBJLoader from './three/loader_OBJLoader.js'


function radians_to_degrees( radians ){
	return radians * (180/ Math.PI )
}

function degrees_to_radians( degrees ){
	return degrees * ( Math.PI /180)
}

			
			
function random_hex( len ){

	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	let s = ''
	
	for( let i = 0; i < len; i++){
		
		s += Math.floor( Math.random() * 16 ).toString( 16 )

	}
	
	return s

}


function validate_number( ...vals ){

	for( const num of vals ){
		if( typeof( num ) === 'number' ) return num
	}
	// should never get here
	return vals[ vals.length - 1 ]

}

function validate_string( ...vals ){

	for( const str of vals ){
		if( typeof( str ) === 'string' ) return str
	}
	// should never get here
	return vals[ vals.length - 1 ]

}


function validate_vec3( ...inputs ){

	for( const input of inputs ){

		if( input ){

			if( input.isVector3 ){

				return input

			}else{

				if( typeof( input.x ) === 'number' && typeof( input.y ) === 'number' && typeof( input.z ) === 'number' ){
					return new Vector3(
						input.x,
						input.y,
						input.z
					)
				}else if( typeof( input._x ) === 'number' && typeof( input._y ) === 'number' && typeof( input._z ) === 'number' ){
					return new Vector3(
						input._x,
						input._y,
						input._z
					)
				}

			}
		}

	}

	return new Vector3( 0,0,0 )

}



// function glob_geometries( type ){

// 	let buffer_geometry = new BufferGeometry()

// 	return new Promise((resolve, reject)=>{

// 		let filepath

// 		if( type === 'tree' ){

// 			filepath = '/resource/geometries/mypine.glb'

// 			GLTF.load( filepath,
// 			// gltf.load( '/resource/geometries/' + this.data.model_url, 

// 			( obj ) => {

// 				// console.log('??', obj )

// 				for( const child of obj.scene.children ){
// 					buffer_geometry.merge( child.geometry )
// 				}

// 				resolve( buffer_geometry )

// 			}, (xhr) => {

// 				// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )

// 			}, ( error ) => {

// 				console.log('error loading model: ', error, filepath )
// 				reject( 'model not found', filepath )

// 			})

// 		}else{

// 			reject('unhandled model type')

// 		}

// 	})

// }



function validate_quat( ...inputs ){

	for( const input of inputs ){

		if( input ){

			if( input.isQuaternion ){

				return input

			}else{

				if( typeof( input.x ) === 'number' && typeof( input.y ) === 'number' && typeof( input.z ) === 'number' && typeof( input.w ) === 'number' ){
					return new Quaternion( input.x, input.y, input.z, input.w )
				}else if( typeof( input._x ) === 'number' && typeof( input._y ) === 'number' && typeof( input._z ) === 'number' && typeof( input._w ) === 'number' ){
					return new Quaternion( input._x, input._y, input._z, input._w )
				}
				// typeof( input.x ) === 'number' ? input.x : ( typeof( input._x ) === 'number' ? input._x : 0 ),
				// typeof( input.y ) === 'number' ? input.y : ( typeof( input._y ) === 'number' ? input._y : 0 ),
				// typeof( input.z ) === 'number' ? input.z : ( typeof( input._z ) === 'number' ? input._z : 0 ),
				// typeof( input.w ) === 'number' ? input.w : ( typeof( input._w ) === 'number' ? input._w : 0 )

			}

		}

	}

	return new Quaternion( 0,0,0,0 )

}



function load( type, filepath ){

	console.log('model load: ', type, filepath )

	return new Promise((resolve, reject)=>{

		switch ( type ){

			case 'buffer_geometry':
				BuffGeoLoader.load( filepath, 
				( obj ) => {
					resolve( obj )
				}, (xhr) => {
					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
				}, ( error ) => {
					console.log('error loading model: ', error, filepath )
					reject( 'model not found', filepath )
				})

				break;

			case 'gltf':
				GLTF.load( filepath, 
				( obj ) => {
					resolve( obj )
				}, (xhr) => {
					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
				}, ( error ) => {
					console.log('error loading model: ', error, filepath )
					reject( 'model not found', filepath )
				})

				break;

			case 'json':
				ObjectLoader.load( filepath, 
				( obj ) => {
					resolve( obj )
				}, (xhr) => {
					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
				}, ( error ) => {
					console.log('error loading model: ', error, filepath )
					reject( 'model not found', filepath )
				})
				break;

			case 'obj':
				OBJLoader.load( filepath, 
				( obj ) => {
					resolve( obj )
				}, (xhr) => {
					// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
				}, ( error ) => {
					console.log('error loading model: ', error, filepath )
					reject( 'model not found', filepath )
				})
				break;

			default: 
				reject('invalid model file request')
				break;

		}

	})

}




const rando_position = new Vector3()
const rando_rotation = new Euler()
const rando_quaternion = new Quaternion()
const rando_scale = new Vector3()

function randomize_matrix( matrix, options, blorb ){

	rando_position.x = options.exclude.position.x ? 0 : Math.random() * options.position
	rando_position.y = options.exclude.position.y ? 0 : Math.random() * options.position
	rando_position.z = options.exclude.position.z ? 0 : Math.random() * options.position

	if( blorb ) rando_position.y = -1

	rando_rotation.x = options.exclude.rotation.x ? 0 : Math.random() * 2 * Math.PI
	rando_rotation.y = options.exclude.rotation.y ? 0 : Math.random() * 2 * Math.PI
	rando_rotation.z = options.exclude.rotation.z ? 0 : Math.random() * 2 * Math.PI

	rando_quaternion.setFromEuler( rando_rotation )

	rando_scale.x = rando_scale.y = rando_scale.z = options.init_scale - options.scale_range + ( 2 * ( Math.random() * options.scale_range ) )

	matrix.compose( rando_position, rando_quaternion, rando_scale )

}



function get_dimensions( mesh ){
	const box = new Box3()
	box.setFromObject( mesh )
	return {
		x: box.max.x - box.min.x,
		y: box.max.y - box.min.y,
		z: box.max.z - box.min.z,
	}
}


const map_entity = {
	'flora': 'FLORA',
	'npc': 'NPCS',
	'toon': 'TOONS',
	'structure': 'STRUCTURES'
}


const map_weapon = {
	'left hand': 'hand_swing',
	'right hand': 'hand_swing',
	'melee': 'melee_basic',
	'ranged': 'ranged_basic',
	'magic': 'magic_basic',
	'mega sword': 'slice',
}

function map_weapon_texture( item ){

	if( map_weapon[ item.name ] ){
		return map_weapon[ item.name ]
	}else if( map_weapon[ item.subtype ] ){
		return map_weapon[ item.subtype ]
	}else if( map_weapon[ item.type ] ){
		return map_weapon[ item.type ]
	}
	return false
}


function identify( type, entity ){

	switch( type ){

		case 'name':
			return ( entity.name || entity.subtype || entity.type )

		case 'model':
			return ( entity.model_url || entity.subtype || entity.type )

		case 'icon':
			return ( entity.icon_url || entity.subtype || entity.type )

		default: 
			return entity.subtype || entity.type

	}

}


function scale_to_match( source_mesh, dest_mesh ){

	const bbox_source = new Box3().setFromObject( source_mesh ).getSize()
	const bbox_dest = new Box3().setFromObject( dest_mesh ).getSize()

	const scale = new Vector3( 
		bbox_dest.x / bbox_source.x,
		bbox_dest.y / bbox_source.y,
		bbox_dest.z / bbox_source.z,
	)

	return scale

}




export {
	random_hex,
	degrees_to_radians,
	radians_to_degrees,
	validate_number,
	validate_string,
	validate_quat,
	validate_vec3,
	// glob_geometries,
	load,
	randomize_matrix,
	map_entity,
	map_weapon_texture,
	identify,
	get_dimensions,
	scale_to_match,
	// clear_object
}