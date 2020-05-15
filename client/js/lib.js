import {
	Vector3,
	Quaternion,
	BufferGeometry,

} from './lib/three.module.js'

import GLTF from './three/GLTF.js'
import BuffGeoLoader from './three/BuffGeoLoader.js'
import ObjectLoader from './three/ObjectLoader.js'


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

			default: 
				reject('invalid model file request')
				break;

		}

	})

}




const rando_position = new Vector3()
// const rando_rotation = new Euler()
const rando_quaternion = new Quaternion()
const rando_scale = new Vector3()

function randomize_matrix( matrix, options ){

	rando_position.x = options.exclude.x ? 0 : Math.random() * options.position
	rando_position.y = options.exclude.y ? 0 : Math.random() * options.position
	rando_position.z = options.exclude.z ? 0 : Math.random() * options.position

	// rando_rotation.x = Math.random() * 2 * Math.PI
	// rando_rotation.y = Math.random() * 2 * Math.PI
	// rando_rotation.z = Math.random() * 2 * Math.PI

	// rando_quaternion.setFromEuler( rotation )

	rando_scale.x = rando_scale.y = rando_scale.z = ( 1 - options.scale ) + ( 2 * ( Math.random() * options.scale ) )

	matrix.compose( rando_position, rando_quaternion, rando_scale )

}


const entity_map = {
	'flora': 'FLORA',
	'npc': 'NPCS',
	'toon': 'TOONS',
	'structure': 'STRUCTURES'
}


function identify( entity ){
	return ( entity.name || entity.subtype || entity.type )
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
	entity_map,
	identify
	// clear_object
}