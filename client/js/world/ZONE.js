import env from '../env.js'

import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'
import * as LIGHT from '../three/LIGHT.js'

import GLOBAL from '../GLOBAL.js'
import TOONS from './TOONS.js'

import Toon from './Toon.js'

import Foliage from './env/Foliage.js'

import * as KEYS from './ui/KEYS.js'
import * as MOUSE from './ui/MOUSE.js'
import CHAT from './ui/CHAT.js'
// import DIALOGUE from './'

import * as ANIMATE from './animate.js'

import {
	Vector3,
	Quaternion,
	PlaneBufferGeometry,
	MeshLambertMaterial,
	DoubleSide,
	Mesh
} from '../lib/three.module.js'

if( env.EXPOSE ){
	window.SCENE = SCENE
}



let new_pos, new_quat, old_pos, old_quat, needs_move, needs_rotate




class Zone {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init )){
			this[ key ] = init[ key ]
		}

		this.intervals = {
			anim_sweeper: false
		}

	}

	initialize(){

		KEYS.init()
		MOUSE.init()
		CHAT.init()
		// DIALOGUE.init()

		const TOON = window.TOON

		TOON.model('self')

		// TOON.MODEL.position.set( 
		// 	TOON.ref.position.x + Math.floor( Math.random() * 10 ), 
		// 	TOON.height / 2, 
		// 	TOON.ref.position.z + Math.floor( Math.random() * 10 )
		// )

		// TOON.MODEL.position.set( 0, 0, 0 )

		// TOON.MODEL.add( LIGHT.spotlight )
		SCENE.add( LIGHT.spotlight )
		LIGHT.spotlight.target = TOON.MODEL
		SCENE.add( LIGHT.hemispherical )

		SCENE.add( TOON.MODEL )
		TOON.MODEL.position.copy( TOON.ref.position )

		// TOON.HEAD.add( CAMERA )
		TOON.MODEL.add( CAMERA )

		CAMERA.position.set( 0, 100, 0 )



		setTimeout(function(){
			// CAMERA.lookAt( window.TOON.MODEL.position.clone().add( TOON.HEAD.position ) )
			CAMERA.lookAt( TOON.MODEL.position ) 

			RENDERER.frame( SCENE )

		}, 100 )

		TOON.begin_intervals()

		this.begin_intervals()

		CHAT.begin_pulse()

		window.CAMERA = CAMERA

	}



	render(){

		// tiles

		const geometry = new PlaneBufferGeometry( MAP.TILE_WIDTH, MAP.TILE_WIDTH, 32 )
		const material = new MeshLambertMaterial({ 
			color: 0x222200, 
			side: DoubleSide 
		})

		let tile
		let width = Math.ceil( MAP.ZONE_WIDTH / MAP.TILE_WIDTH ) + 2
		let height = Math.ceil( MAP.ZONE_WIDTH / MAP.TILE_WIDTH ) + 2

		for( let x = -2; x < width; x++ ){
			for( let z = -2; z < height; z++ ){
				
				const ground = new Mesh( geometry, material )
				ground.receiveShadow = true
				ground.rotation.x = Math.PI / 2
				ground.position.set( x * MAP.TILE_WIDTH + ( x ), .1, z * MAP.TILE_WIDTH  + ( z ))
				SCENE.add( ground )

			}	
		}

		// foliage

		// let tree
		for( let i = 0; i < 100; i++ ){
			const tree = new Foliage()
			tree.model()
			.then(res=>{
				tree.MODEL.position.set(
					Math.floor( Math.random() * MAP.ZONE_WIDTH ),
					1,
					Math.floor( Math.random() * MAP.ZONE_WIDTH ),
				)
				// console.log( tree.MODEL.position )
				SCENE.add( tree.MODEL )
			}).catch(err=>{
				console.log('err load: ', err )
			})
		}

	}




	begin_intervals(){

		this.intervals.anim_sweeper = setInterval(function(){

			for( const mud_id of ANIMATE.moving_toons ){
				if( !TOONS[ mud_id ]) ANIMATE.moving_toons.splice( ANIMATE.moving_toons.indexOf( mud_id ), 1 )
			}
			for( const mud_id of ANIMATE.rotating_toons ){
				if( !TOONS[ mud_id ]) ANIMATE.rotating_toons.splice( ANIMATE.rotating_toons.indexOf( mud_id ), 1 )
			}

		}, 10000 )

		if( env.LOCAL ){

			this.intervals.dev = setInterval(function(){

				SOCKET.send(JSON.stringify({
					type: 'dev_ping'
				}))

			}, 2000 )

		}

	}






	handle_move( packet ){

		for( const mud_id of Object.keys( packet ) ){

			if( window.TOON.mud_id !== mud_id ){

				if( !TOONS[ mud_id ] ){

					console.log('requesting: ', mud_id )

					window.SOCKET.send(JSON.stringify({
						type: 'toon_ping',
						mud_id: mud_id
					}))

				}else{

					// console.log('updating patron pos: ', mud_id )
					needs_move = needs_rotate = false

					// if( !TOONS[ mud_id ] ) console.log('wtf: ', TOONS[ mud_id ] )
					new_pos = packet[ mud_id ].position
					new_quat = packet[ mud_id ].quaternion
					old_pos = TOONS[ mud_id ].ref.position
					old_quat = TOONS[ mud_id ].ref.quaternion

					if( new_pos.x !== old_pos.x || new_pos.y !== old_pos.y || new_pos.z !== old_pos.z )  needs_move = true
					if( new_quat._x !== old_quat._x || new_quat._y !== old_quat._y || new_quat._z !== old_quat._z || new_quat._w !== old_quat._w )  needs_rotate = true

					if( needs_move ){

						old_pos.set(
							new_pos.x,
							new_pos.y,
							new_pos.z
						)
						// old_pos.x = new_pos.x
						// old_pos.y = new_pos.y
						// old_pos.z = new_pos.z

					}

					if( needs_rotate ){

						// old_quat = new Quaternion( 
						old_quat.set( 
							new_quat._x,
							new_quat._y,
							new_quat._z,
							new_quat._w
						)

					}

					if( needs_move ) ANIMATE.receive_move()
					if( needs_rotate ) ANIMATE.receive_rotate()

					TOONS[ mud_id ].needs_move = needs_move
					TOONS[ mud_id ].needs_rotate = Number( needs_rotate ) * 400

				}

			}else{

				// console.log('skipping self data in move pulse')

			}

		}

	}


	touch_toon( packet ){

		if( packet.toon ){
			if( TOONS[ packet.toon.mud_id ] ){
				// update
			}else{
				TOONS[ packet.toon.mud_id ] = new Toon( packet.toon )
				TOONS[ packet.toon.mud_id ].model()
				SCENE.add( TOONS[ packet.toon.mud_id ].MODEL )
				TOONS[ packet.toon.mud_id ].MODEL.position.set(
					TOONS[ packet.toon.mud_id ].ref.position.x,
					TOONS[ packet.toon.mud_id ].ref.position.y,
					TOONS[ packet.toon.mud_id ].ref.position.z
				)

				RENDERER.frame( SCENE )

			}
		}

	}


}





let zone = false

export default (function(){
	if( zone ) return zone
	zone = new Zone()
	return zone
})();

