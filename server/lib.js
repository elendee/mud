const MAP = require('./MAP.js')

const log = require('./log.js')

const p_validator = require('password-validator')
const e_validator = require('email-validator')

const name_schema = new p_validator()

const password_schema = new p_validator()

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




function zone_id( x, z, altitude ){
	if( typeof( x ) !== 'number' || typeof( z ) !== 'number' || typeof( altitude ) !== 'number' ){
		log('flag', 'failed to build zone id: ', x, z, altitude )
		return false
	}
	return x + '-' + z + '-' + altitude
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


function random_rgb( min, max ){

	if( max < min || min < 0 || max > 255 ) return 'rgb( 0, 0, 0 )'

	let r = min + Math.floor( Math.random() * ( max - min ))
	let g = min + Math.floor( Math.random() * ( max - min ))
	let b = min + Math.floor( Math.random() * ( max - min ))

	return 'rgb(' + r + ',' + g + ',' + b + ')'

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
	zone_id
}

