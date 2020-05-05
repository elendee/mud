// import * as THREE from '../build/module.js';

import {
	// WebGLRenderer,
	// PerspectiveCamera,
	// Scene,
	// CircleBufferGeometry,
	BoxBufferGeometry,
	InstancedBufferGeometry,
	InstancedBufferAttribute,
	RawShaderMaterial,
	ShaderMaterial,
	TextureLoader,
	Mesh,
	MeshLambertMaterial,
	MeshBasicMaterial
} from '../../lib/three.module.js'

// import Stats from './jsm/libs/stats.module.js';

var container, stats;

var camera, scene, renderer;
var geometry, material, mesh;

// function init() {

export default function(){

	// var circleGeometry = new CircleBufferGeometry( .5, 6 );
	var boxGeometry = new BoxBufferGeometry( 1, 1, 1 );

	geometry = new InstancedBufferGeometry();
	geometry.index = boxGeometry.index;
	geometry.attributes = boxGeometry.attributes;

	var particleCount = 10000;

	var translateArray = new Float32Array( particleCount * 3 );

	for ( var i = 0, i3 = 0, l = particleCount; i < l; i ++, i3 += 3 ) {

		translateArray[ i3 + 0 ] = Math.random() * 2 - 1;
		// translateArray[ i3 + 1 ] = Math.random() * 2 - 1;
		0;
		// translateArray[ i3 + 2 ] = Math.random() * 2 - 1;
		translateArray[ i3 + 2 ] = Math.random() * 2 - 1;

	}

	geometry.setAttribute( 'translate', new InstancedBufferAttribute( translateArray, 3 ) );

	material = new RawShaderMaterial( {
	// material = new ShaderMaterial( {
		uniforms: {
			// "color": { value: 0xffff11 },
			"map": { value: new TextureLoader().load( '/resource/textures/circle.png' ) },
			"time": { value: 0.0 }
		},
		vertexShader: document.getElementById( 'vshader' ).textContent,
		fragmentShader: document.getElementById( 'fshader' ).textContent,
		// depthTest: true,
		// depthWrite: true
	} );
	// material = new MeshLambertMaterial({
	// material = new MeshBasicMaterial({
	// 	color: 0xffff11,
	// 	depthWrite: true,
	// 	depthTest: true
	// })

	mesh = new Mesh( geometry, material );
	// mesh.scale.set( 100, 100, 100 );

	return mesh


}