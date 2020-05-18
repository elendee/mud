import {
	Color
} from '../../lib/three.module.js'


const uniforms = {
    colorA: {
    	type: 'vec3', 
    	value: new Color( 0x221122 ) 
    },
    colorB: {
    	type: 'vec3', 
    	value: new Color( 0x112211 ) 
    },
}






function baseVertexShader() {
	return `
		void main() {
		  gl_Position = projectionMatrix *
		    modelViewMatrix *
		    vec4(position,1.0);
		}
`
	// return `
	// 	varying vec3 vUv; 

	// 	void main() {
	// 		vUv = position; 

 //    		vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
 //    		gl_Position = projectionMatrix * modelViewPosition; 
 //    	}
 //    `
}


function sampleFragment(){
	return `
		#ifdef GL_ES
		precision mediump float;
		#endif

		uniform vec2 u_resolution;
		uniform vec2 u_mouse;
		uniform float u_time;

		void main() {
			vec2 st = gl_FragCoord.xy/1000.;
			gl_FragColor = vec4(st.x,st.y,1.,1.0);
		}`
}

function baseFragmentShader(){
	return `
	    uniform vec3 colorA;
	    uniform vec3 colorB;
	    varying vec3 vUv;

	    void main() {
			gl_FragColor = vec4( colorB, 1.0 );
	    }
`
}
// gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);

// const cube_geo = new BoxBufferGeometry(10, 10, 10)
// // const cube_geo = new BoxGeometry(10, 10, 10)
// const cube_mat = new ShaderMaterial({
// 	uniforms: uniforms,
// 	vertexShader: vertexShader(),
// 	fragmentShader: fragmentShader()
// })
// const cube = new Mesh( cube_geo, cube_mat )
// SCENE.add( cube )
// cube.position.set( 50, 1, 10 )

export {
	baseFragmentShader,
	baseVertexShader,
	sampleFragment,
	uniforms
}