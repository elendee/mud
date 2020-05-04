import { 
	Vector4,
	DoubleSide,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	// Float32Array,
	Float32BufferAttribute,
	Mesh,
	RawShaderMaterial
} from '../../lib/three.module.js'


export default function grass_mesh(){

	var vector = new Vector4();

	var instances = 20000;

	var positions = [];
	var offsets = [];
	var colors = [];
	var orientationsStart = [];
	var orientationsEnd = [];

	positions.push( 0.2, - 0.2, 0 );
	positions.push( - 0.2, 0.2, 0 );
	positions.push( 0, 0, 0.2 );

	// instanced attributes

	for ( var i = 0; i < instances; i ++ ) {

		// offsets
		offsets.push( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
		// 

		// colors

		colors.push( Math.random(), Math.random(), Math.random(), Math.random() );

		// orientation start
		// Math.random() * 2 - 1
		vector.set( Math.random() * 2 - 1, 0, Math.random() * 2 - 1, Math.random() * 2 - 1 );
		vector.normalize();

		orientationsStart.push( vector.x, vector.y, vector.z, vector.w );

		// orientation end
		vector.set( Math.random() * 2 - 1, 0, Math.random() * 2 - 1, Math.random() * 2 - 1 );
		vector.normalize();

		orientationsEnd.push( vector.x, vector.y, vector.z, vector.w );

	}

	var geometry = new InstancedBufferGeometry();
	// geometry.maxInstancedCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise

	geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

	geometry.setAttribute( 'offset', new InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
	geometry.setAttribute( 'color', new InstancedBufferAttribute( new Float32Array( colors ), 4 ) );
	geometry.setAttribute( 'orientationStart', new InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
	geometry.setAttribute( 'orientationEnd', new InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );

	// material

	var material = new RawShaderMaterial( {

		uniforms: {
			"time": { value: 1.0 },
			"sineTime": { value: 1.0 }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		side: DoubleSide,
		transparent: true

	} );

	//

	var mesh = new Mesh( geometry, material );

	return mesh

	// scene.add( mesh );
}