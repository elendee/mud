import env from '../env.js'

// import uuid from '../../../node_modules/uuid/dist/esm-browser/v4.js'

import { Vector3 } from '../lib.js'

import STATE from './STATE.js'
import DEV from './ui/DEV.js'

window.STATE = STATE

export default class Toon {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

		// this.mud_id = init.mud_id // || uuid()

		this.ref = init.ref = init.ref || {}

		this.ref = init.ref || {}

		this.ref.position = this.ref.position || new Vector3(),

		this.height = init.height || 3

		this.needs_lerp = init.needs_lerp || false
		
		this.needs_stream = false

		this.speed = init.speed || env.SPEED

		this.bindings = {}

	}


	greet(){
		console.log( 'hi im a toon ! ')
	}


	model( type ){

		console.log('toon model needs updating from three....')

		// const face_texture = texLoader.load('/resource/textures/profiles/' + ( this.portrait || 'butterbur.png' ) )
		
		// const geometry = new BoxBufferGeometry( 1, this.height || 3, 1 )
		// const material = new MeshLambertMaterial({
		// 	color: new Color( this.color )
		// })
		// const face_material = new MeshLambertMaterial({
		// 	map: face_texture,
		// 	depthWrite: false,
		// 	side: DoubleSide,
		// 	transparent: true
		// })
		// this.MODEL = new Mesh( geometry, material )
		// this.MODEL.castShadow = true
		// this.MODEL.receiveShadow = true

		// this.MODEL.userData = {
		// 	clickable: true,
		// 	type: type,
		// 	website: this.website,
		// 	name: this.name
		// }

		// const head_geometry = new BoxBufferGeometry( 1.2, 1.2, 1.2 )
		// const head_material = material
		// this.HEAD = new Mesh( head_geometry, material )
		// this.HEAD.castShadow = true
		// this.HEAD.receiveShadow = true
		// this.HEAD.position.set( 0, this.height / 2, 0 ) 

		// const face_geometry = new PlaneBufferGeometry( 2, 2, 2 )
		// // const face_material = material
		// this.FACE = new Mesh( face_geometry, face_material )
		// this.FACE.castShadow = true
		// this.FACE.receiveShadow = true
		// this.FACE.position.set( 0, .5, .7 )

		// this.HEAD.add( this.FACE )
		// this.MODEL.add( this.HEAD )

	}





	begin_stream(){

		const toon = this

		this.stream = setInterval(function(){

			// if( STATE.stream_down ){
			if( TOON.needs_stream ){

				if( window.SOCKET && window.SOCKET.send ){

					window.SOCKET.send(JSON.stringify({
						type: 'move_stream',
						ref: {
							position: toon.MODEL.position,
						}
					}))

				}

				TOON.needs_stream = false

				DEV.render('coords', {
					x: TOON.MODEL.position.x,
					z: TOON.MODEL.position.z
				})

			}

		}, 2000 )

	}

}
