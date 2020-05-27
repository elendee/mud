import * as lib from '../lib.js'
import env from '../env.js'
import hal from '../hal.js'

import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'
import * as LIGHT from '../three/LIGHT.js'


import GLOBAL from '../GLOBAL.js'
import TOONS from './TOONS.js'
import Toon from './Toon.js'
import * as ANIMATE from './animate.js'

// import BuffGeoLoader from '../three/BuffGeoLoader.js'
import * as SHADERS from './env/shaders.js'

import Item from './Item.js'

// import Npc from './Npc.js'
import grass_mesh from './env/grass_mesh.js'

import * as KEYS from './ui/KEYS.js'
import * as MOUSE from './ui/MOUSE.js'
import CHAT from './ui/CHAT.js'
import * as EFFECTS from './ui/EFFECTS.js'
import TARGET from './ui/TARGET.js'


// import DIALOGUE from './'


import {
	Geometry,
	Vector3,
	Quaternion,
	PlaneBufferGeometry,
	BoxBufferGeometry,
	BoxGeometry,
	MeshLambertMaterial,
	DoubleSide,
	Mesh,
	InstancedMesh,
	Object3D,
	Matrix4,
	Color,
	ShaderMaterial
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

		this.FLORA = {}
		this.STRUCTURES = {}
		this.NPCS = {}
		this.TOONS = {}

		this.ITEMS = {}

		this.model_map = []
		this.material_map = []

	}

	initialize(){

		KEYS.init( this )
		MOUSE.init( this )
		CHAT.init()
		// DIALOGUE.init()

		const TOON = window.TOON

		TOON.model()
		TOON.MODEL.userData.self = true

		this.TOONS[ TOON.mud_id ] = TOON

		// TOON.MODEL.position.set( 
		// 	TOON.ref.position.x + Math.floor( Math.random() * 10 ), 
		// 	TOON.height / 2, 
		// 	TOON.ref.position.z + Math.floor( Math.random() * 10 )
		// )

		// TOON.MODEL.position.set( 0, 0, 0 )

		// TOON.MODEL.add( LIGHT.spotlight )
		SCENE.add( LIGHT.hemispherical )
		// SCENE.add( LIGHT.spotlight )
		SCENE.add( LIGHT.directional )
		// LIGHT.directional.position.set( MAP.ZONE_WIDTH * .66, 100, MAP.ZONE_WIDTH * .66 )
		LIGHT.directional.position.set( 
			MAP.ZONE_WIDTH, 
			501, 
			MAP.ZONE_WIDTH 
		)

		const ltarget = new Object3D()
		ltarget.position.set( MAP.ZONE_WIDTH / 2 , 0, MAP.ZONE_WIDTH / 2 )
		SCENE.add( ltarget )
		LIGHT.directional.target = ltarget

		// LIGHT.spotlight.target = TOON.MODEL
		TOON.MODEL.position.copy( TOON.ref.position )

		TOON.MODEL.position.y = lib.get_dimensions( TOON.MODEL ).y / 2

		SCENE.add( TOON.MODEL )

		// console.log( lib.get_dimensions( TOON.MODEL ) )
		// SCENE.add( LIGHT.helper )

		// les get dat Y attr ------------------------------

		// TOON.MODEL.position.copy( TOON.ref.position )

		LIGHT.helper.position.copy( TOON.MODEL.position )

		// TOON.HEAD.add( CAMERA )
		// TOON.MODEL.add( CAMERA )
		SCENE.add( CAMERA )
	    CAMERA.position.copy( window.TOON.MODEL.position ).add( CAMERA.offset )

		// CAMERA.position.set( 0, 150, 20 )

		TOON.begin_intervals()

		this.begin_intervals()

		CHAT.begin_pulse()

		if( env.EXPOSE ) window.CAMERA = CAMERA

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





	apply_resolution( resolution ){

		// console.log( resolution )

		let target, attacker

		target = this[ lib.map_entity[ resolution.target_type ] ][ resolution.target_id ]
		attacker = this[ lib.map_entity[ resolution.attacker_type ] ][ resolution.attacker ]

		if( !target || !attacker ){
			console.log('incomplete resolution data', resolution )
			return false
		}

		if( resolution.type === 'combat' ){

			target.health.current = resolution.target_health

		}

		if( resolution.status === 'dead' ){

			// target.MODEL.rotateOnWorldAxis( GLOBAL.UP, 1 )

			ANIMATE.animators.push( new ANIMATE.Animator({
				model: target.MODEL,
				// current: target.MODEL.rotation.x,
				limit: -Math.PI / 2,
				step: ( delta_seconds, model )=>{
					model.rotation.x -= 1 * delta_seconds
				},
				test: ( model, limit )=>{
					return model.rotation.x > limit
				}
			}))

			TARGET.clear()

			ANIMATE.animate( true )

			// SCENE.remove( target.MODEL )

			setTimeout(function(){
				if( SCENE && target.MODEL )  SCENE.remove( target.MODEL )
				RENDERER.frame( SCENE )
			}, 1000 * 60 * 1 )

		}

		this.render_resolution_flash( target, attacker, resolution )

		this.render_resolution_text( target, attacker, resolution )

	}




	render_resolution_flash( target, attacker, resolution ){

		let type
		// , flash_target

		// if( TARGET.target && TARGET.target.mud_id === resolution.target_id ){
		// 	TARGET.show_status()
		// 	flash_target = target
		// }else if( resolution.target_id === window.TOON.mud_id ){
		// 	window.TOON.show_status()
		// 	flash_target = target
		// }

		// if( flash_target.health.current <= 0 )  type = 'death'
		if( target.health.current <= 0 ) type = 'death'

		if( resolution.success ){

			let flash_type = 'generic'

			if( type === 'death' ){
				flash_type = 'death'
			}else if( type === 'death' ){
				flash_type = 'receive_melee'
			}

			const flash = new EFFECTS.Flash({
				target: target,
				// flash_target,
				type: type
				// flash_type
			})
			flash.step()

		}

	}




	render_resolution_text( target, attacker, resolution ){

		let msg, type

		type = resolution.type

		if( resolution.success ){

			if( resolution.target_id === window.TOON.mud_id ){
				msg = lib.identify( 'name', attacker ) + ' attacks you for ' + resolution.dmg
			}else if( resolution.attacker === window.TOON.mud_id ){
				msg = 'You attack ' + lib.identify( 'name', target ) + ' for ' + resolution.dmg
			}

		}else{

			if( resolution.target_id === window.TOON.mud_id ){

				switch( resolution.fail ){
					case 'range':
						msg = lib.identify( 'name', attacker ) + ' fails to reach you'
						break;
					case 'target_dead':
						msg = lib.identify( 'name', attacker ) + ' attacks the dead corpse of ' + lib.identify( 'name', target )
						break;
					default: break;
				}
			}else if( resolution.attacker === window.TOON.mud_id ){
				switch( resolution.fail ){
					case 'range':
						msg = 'You fail to reach ' + lib.identify( 'name', target )
						break;
					case 'target_dead':
						msg = 'You attack the dead corpse of ' + lib.identify( 'name', target )
						break;
					default: break;
				}
			}

			type = 'error'

		}

		hal( type, msg, 2000 )

	}


	// render_decomposers( packet ){

	// 	let decomposers = packet

	// 	for( const mud_id of Object.keys( decomposers )){
	// 		if( !this.DECOMPOSERS[ mud_id ]){
	// 			this.DECOMPOSERS[ mud_id ] = new Item( items[ mud_id ] )
	// 			this.DECOMPOSERS[ mud_id ].model()
	// 			SCENE.add( this.DECOMPOSERS[ mud_id ].MODEL )
	// 		}
	// 		// console.log( 'render decompose: ', decomposers[ mud_id ])
	// 	}

	// }


	render_items( packet ){

		const items = packet

		for( const mud_id of Object.keys( items )){
			// console.log( 'render item: ', item[ mud_id ] )
			if( !this.ITEMS[ mud_id ]){
				this.ITEMS[ mud_id ] = new Item( items[ mud_id ] )
				this.ITEMS[ mud_id ].model()
				SCENE.add( this.ITEMS[ mud_id ].MODEL )
			}

		}

		SCENE.traverse(( obj ) => {
			if( obj.userData && obj.userData.mud_id && obj.userData.type === 'item' ){
				if( !items[ obj.userData.mud_id ] ){
					console.log('removing _dep item')
					SCENE.remove( obj )
				}
			}
		})

	}



	set_target( clicked ){

		TARGET.set( this, clicked )

	}


	clear_acquisition( mud_id ){

		const mesh = SCENE.get_mud_id( mud_id )
		SCENE.remove( mesh )
		TARGET.clear()
		delete zone.ITEMS[ mud_id ]
		RENDERER.frame( SCENE )

	}

						



}










RENDERER.onWindowResize = function(){

	CAMERA.aspect = window.innerWidth / window.innerHeight
	CAMERA.updateProjectionMatrix()

	RENDERER.setSize( 
		window.innerWidth / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
		window.innerHeight / GLOBAL.RES_MAP[ GLOBAL.RES_KEY ], 
		false 
	)

	RENDERER.frame( SCENE )
}




let zone = false

export default (function(){
	if( zone ) return zone
	zone = new Zone()
	return zone
})();

