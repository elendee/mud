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

function gen_portrait(){

	const portrait = MAP.PORTRAITS[ Math.floor( Math.random() * MAP.PORTRAITS.length ) ]

	return portrait

}

function sanitize_packet( packet ){

	return packet

}

function parse_id( id ){

	if( !id ) return false
	if( id.toString ) return id.toString()
	if( typeof( id ) === 'string' ) return id
	return false

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



















class Vector3 {

	constructor( init ){

		this.isVector3 = true
		this.x = init.x || 0
		this.y = init.y || 0
		this.z = init.z || 0

	}

	set ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	setScalar ( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	}

	setX ( x ) {

		this.x = x;

		return this;

	}

	setY ( y ) {

		this.y = y;

		return this;

	}

	setZ ( z ) {

		this.z = z;

		return this;

	}

	setComponent ( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent ( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone () {

		return new this.constructor( this.x, this.y, this.z );

	}

	copy ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add ( v, w ) {

		if ( w !== undefined ) {

			console.log( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	addScaledVector ( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	}

	sub ( v, w ) {

		if ( w !== undefined ) {

			console.log( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar ( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply ( v, w ) {

		if ( w !== undefined ) {

			console.log( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	multiplyVectors ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	applyEuler ( euler ) {

		if ( ! ( euler && euler.isEuler ) ) {

			console.log( 'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.' );

		}

		return this.applyQuaternion( _quaternion.setFromEuler( euler ) );

	}

	applyAxisAngle ( axis, angle ) {

		return this.applyQuaternion( _quaternion.setFromAxisAngle( axis, angle ) );

	}

	applyMatrix3 ( m ) {

		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	}

	applyNormalMatrix ( m ) {

		return this.applyMatrix3( m ).normalize();

	}

	applyMatrix4 ( m ) {

		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;

		var w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion ( q ) {

		var x = this.x, y = this.y, z = this.z;
		var qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	project ( camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

	}

	unproject ( camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

	}

	transformDirection ( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this.x, y = this.y, z = this.z;
		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	divide ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	min ( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	max ( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	clamp ( min, max ) {

		// assumes min < max, componentwise

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

	clampScalar ( minVal, maxVal ) {

		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
		this.z = Math.max( minVal, Math.min( maxVal, this.z ) );

		return this;

	}

	clampLength ( min, max ) {

		var length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	}

	floor () {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}

	ceil () {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}

	round () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

	roundToZero () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	}

	negate () {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	dot ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

	// TODO lengthSquared?

	lengthSq () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	}

	length () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

	manhattanLength () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	normalize () {

		return this.divideScalar( this.length() || 1 );

	}

	setLength ( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	}

	lerpVectors ( v1, v2, alpha ) {

		return this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

	}

	cross ( v, w ) {

		if ( w !== undefined ) {

			console.log( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		return this.crossVectors( this, v );

	}

	crossVectors ( a, b ) {

		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

	projectOnVector ( v ) {

		// v cannot be the zero v

		var scalar = v.dot( this ) / v.lengthSq();

		return this.copy( v ).multiplyScalar( scalar );

	}

	projectOnPlane ( planeNormal ) {

		_vector.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector );

	}

	reflect ( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}

	angleTo ( v ) {

		var denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) { console.log( 'THREE.Vector3: angleTo() can\'t handle zero length vectors.' ); }

		var theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( _Math.clamp( theta, - 1, 1 ) );

	}

	distanceTo ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	manhattanDistanceTo ( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

	}

	setFromSpherical ( s ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	}

	setFromSphericalCoords ( radius, phi, theta ) {

		var sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	setFromCylindrical ( c ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	}

	setFromCylindricalCoords ( radius, theta, y ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	}

	setFromMatrixPosition ( m ) {

		var e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	setFromMatrixScale ( m ) {

		var sx = this.setFromMatrixColumn( m, 0 ).length();
		var sy = this.setFromMatrixColumn( m, 1 ).length();
		var sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	}

	setFromMatrixColumn ( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	}

	equals ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	fromArray ( array, offset ) {

		if ( offset === undefined ) { offset = 0; }

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	toArray ( array, offset ) {

		if ( array === undefined ) { array = []; }
		if ( offset === undefined ) { offset = 0; }

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	fromBufferAttribute ( attribute, index, offset ) {

		if ( offset !== undefined ) {

			console.log( 'THREE.Vector3: offset has been removed from .fromBufferAttribute().' );

		}

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

}





module.exports = {
	tables,
	gen_portrait,
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
	Vector3,	
}

