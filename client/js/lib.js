

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




export {
	random_hex,
	degrees_to_radians,
	radians_to_degrees,
	validate_number,
	validate_string
	// clear_object
}