import {
	Vector3,
	Quaternion
} from './lib/three.module.js'


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



export {
	random_hex,
	degrees_to_radians,
	radians_to_degrees,
	validate_number,
	validate_string,
	validate_quat,
	validate_vec3
	// clear_object
}