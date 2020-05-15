const MAP = require('./MAP.js')

const log = require('./log.js')

const p_validator = require('password-validator')
const e_validator = require('email-validator')

const name_schema = new p_validator()

const password_schema = new p_validator()

const {
	Vector3,
	Quaternion
} = require('three')

name_schema
	.is().min(3)
	.is().max(25)
	.has().not().spaces()
	// .has().not().digits()

password_schema
	.is().min(5)
	.is().max(25)
	.has().not().spaces()




const tables = {
	verboten: ['fuk', 'fuck', 'cunt', 'damn', 'nigger', 'kike', 'chink', 'bitch']
}

// function gen_portrait(){

// 	const portrait = MAP.PORTRAITS[ Math.floor( Math.random() * MAP.PORTRAITS.length ) ]

// 	return portrait

// }

function sanitize_packet( packet ){

	return packet

}

function parse_id( id ){

	if( !id ) return false
	if( id.toString ) return id.toString()
	if( typeof( id ) === 'string' ) return id
	return false

}




function zone_id( x, z, layer ){
	if( typeof( x ) !== 'number' || typeof( z ) !== 'number' || typeof( layer ) !== 'number' ){
		log('flag', 'failed to build zone id: ', x, z, layer )
		return false
	}
	return x + '-' + z + '-' + layer
}

// sanitize_chat: sanitize_chat,	

// is_valid_name: is_valid_name,

// is_valid_password: is_valid_password,

// is_valid_portrait: is_valid_portrait,

// is_valid_website: is_valid_website,

// is_valid_email: is_valid_email,

// random_hex: random_hex,

// random_rgb: random_rgb,

function two_decimals( float ){

	return Math.round(( float + Number.EPSILON ) * 100) / 100

}

function rgb_to_hex( rgb_color, received_scale, type ){
	let the_numbers
	if( type == 'array' ){
		the_numbers = rgb_color
	}else{
		the_numbers = rgb_color.split("(")[1].split(")")[0];
		the_numbers = the_numbers.split(",");
		the_numbers.forEach(function( num ){
			num = num.trim()
		})
	}
	if( received_scale === 1 ){
		for( let i=0; i < the_numbers.length; i++ ){
			the_numbers[i] *= 255
		}
	}else if( received_scale !== 255 ){
		return '#000'
	}
	let b = the_numbers.map( function(x){						 
		x = parseInt( x ).toString( 16 )
		return ( x.length == 1 ) ? "0" + x : x
	})
	b = "0x" + b.join
	return b
}












function sanitize_chat( chat ){

	if( typeof( chat ) === 'string' ){
		chat = chat.substr( 0, 240 )
		for( const v of tables.verboten ){
			let r = new RegExp( v, 'g')
			chat = chat.replace(r, '---')
		}
		return chat
	}
	return false

}




function is_valid_name( name ){

	let regex = new RegExp( name, 'i' )

	let valid = true

	if( !name ) valid = false

	if( typeof( name ) !== 'string' || name.length > tables.name_length ) return false // yes skip the log here, could be huge

	if( name.match(/^null$/i) ) valid = false

	if( !name_schema.validate( name + '' ) ) valid = false

	// if ( !/^([a-zA-Z]|\'|_|[0-9])*$/g.test( name ) ) valid = false

	for( const w of tables.verboten ){
		if( w.match( regex )){
			valid = false
		}
	}

	if( !valid ) {
		log('flag', 'name regex failed: ', name )
		return false
	}

	return true

}

function is_valid_email( email ){
	if( !e_validator.validate( email ) ) return false
	return true
}


function is_valid_password( password ){

	let valid = true

	if( typeof( password ) !== 'string' ) valid = false

	if( !password_schema.validate( password )) valid = false

	if( password.match(/^null$/i) ) valid = false

	if( !valid ){
		log('flag', 'invalid pw: ', password )
		return false
	}

	return true

}


function is_valid_website( website ){

	let valid = true

	if( typeof( website ) !== 'string' ) valid = false

	if( !website.match(/\..*/) ) valid = false

	if( !valid ){
		log('flag', 'invalid website')
		return false
	}

	return true

}

function is_valid_portrait( portrait ){

	let valid = true

	if( typeof( portrait ) !== 'string' ) valid = false

	if( !portrait.match(/\..*/) ) valid = false

	if( !valid ){
		log('flag', 'invalid portrait')
		return false
	}

	return true

}


function random_hex( len ){

	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	let s = ''
	
	for( let i = 0; i < len; i++){
		
		s += Math.floor( Math.random() * 16 ).toString( 16 )

	}
	
	return s

}


function random_rgb( ...ranges ){

	let inc = 0
	let string = 'rgb('

	for( const range of ranges ){

		if( range[1] < range[0] || range[0] < 0 || range[1] > 255 ) return 'rgb( 0, 0, 0 )'

		string += range[0] + Math.floor( Math.random() * ( range[1] - range[0] )) 

		inc < 2 ? string += ',' : true

		inc++

	}

	return string + ')'

}





// function tile_from_Xpos( toon_x ){
// 	return Math.max( 0, Math.floor( toon_x / MAP.ZONE_WIDTH ) )
// }


// function tile_from_Zpos( toon_z ){
// 	return Math.max( 0, Math.floor( toon_z / MAP.ZONE_WIDTH ) )
// }



function is_iso_date( data ){

	if( typeof( data ) !== 'string' || !data.match(/^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])/)){
		log('flag','failed ISO test', data )
		return false
	}

	return true

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


function validate_seconds( ...vals ){

	for( const val of vals ){
		if( typeof( val ) === 'number' && val > 1000000000 )  return val
	}
	
	return vals[ vals.length - 1 ]
	// if( typeof( init._last_growth ) === 'number' && init._last_growth > 10000000 ){
	// 	return init._last_growth
	// }else if( typeof( init.last_growth === 'number ') && init.last_growth > 10000000 ){
	// 	return init.last_growth
	// }else{
	// 	return new Date('1970').getTime()
	// }
}


const entity_map = {
	'flora': '_FLORA',
	'npc': '_NPCS',
	'toon': '_TOONS',
	'structure': '_STRUCTURES'
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

function get_dist( vec1, vec2 ){

	if( !vec1 || !vec2 || !vec1.isVector3 || !vec2.isVector3 ) return 999999999999999999999

	return vec1.distanceTo( vec2 )

}


function identify( entity ){
	return ( entity.name || entity.subtype || entity.type )
}


module.exports = {
	tables,
	// gen_portrait,
	sanitize_chat,
	sanitize_packet,
	parse_id,
	two_decimals,
	rgb_to_hex,
	is_valid_portrait,
	is_valid_website,
	is_valid_password,
	is_valid_portrait,
	is_valid_name,
	is_valid_email,
	random_hex,
	random_rgb,
	zone_id,
	// tile_from_Zpos,
	// tile_from_Xpos,
	is_iso_date,
	validate_number,
	validate_string,
	validate_seconds,
	validate_vec3,
	validate_quat,
	entity_map,
	get_dist,
	identify
}

