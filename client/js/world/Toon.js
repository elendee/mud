
import * as lib from '../lib.js'
import env from '../env.js'
import MAP from '../MAP.js'
import GLOBAL from '../GLOBAL.js'

import Clickable from './Clickable.js'

import { 
	Vector3,
	Quaternion,
	BoxBufferGeometry,
	SphereBufferGeometry,
	Mesh,
	MeshLambertMaterial,
	Color,
	Group
} from '../lib/three.module.js'

import gltfLoader from '../three/loader_GLTF.js'
import objLoader from '../three/loader_OBJLoader.js'

import RENDERER from '../three/RENDERER.js'
import SCENE from '../three/SCENE.js'

import * as ACTION_BAR from './ui/ACTION_BAR.js'
import DEV from './ui/DEV.js'
import * as MOUSE from './ui/MOUSE.js'
import * as POPUPS from './ui/POPUPS.js'
import * as EFFECTS from './ui/EFFECTS.js'

import STATE from './STATE.js'
// import TOONS from './TOONS.js'
import Item from './Item.js'

import TARGET from './ui/TARGET.js'

if( env.EXPOSE ){
	window.STATE = STATE
	window.Vector3 = Vector3
}

export default class Toon {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

		this.type = init.type || 'toon'

		this.bindings = this.bindings || {}

		this.INVENTORY = false

		// this.ref = init.ref = init.ref || {}

		this.ref = init.ref || {}

		this.ref.position = lib.validate_vec3( this.ref.position, {
			x: 0,
			y: 0,
			z: 0
		})

		// if( this.ref.position ){
		// 	this.ref.position = new Vector3(
		// 		this.ref.position.x,
		// 		this.ref.position.y,
		// 		this.ref.position.z,
		// 	)
		// }else{
		// 	this.ref.position = new Vector3()
		// }

		this.ref.quaternion = lib.validate_quat( this.ref.quaternion, {
			x: 0,
			y: 0,
			z: 0,
			w: 0
		})

		// if( this.ref.quaternion ){
		// 	this.ref.quaternion = new Quaternion(
		// 		this.ref.quaternion._x,
		// 		this.ref.quaternion._y,
		// 		this.ref.quaternion._z,
		// 		this.ref.quaternion._w,
		// 	)
		// }else{
		// 	this.ref.quaternion = new Quaternion()
		// }

		// this.height = init.height || 3
		this.left_hand = init.left_hand ? new Item( init.left_hand ) : new Item({
			type: 'melee',
			name: 'left hand'
		})
		this.right_hand = init.right_hand ? new Item( init.right_hand ) : new Item({
			type: 'melee',
			name: 'right hand'
		})

		this.needs_move = init.needs_move || false
		this.needs_rotate = init.needs_rotate || false
		
		this.needs_stream = false

		this.intervals = {
			stream: false		
		}

		this.direction = 'north'

		if( env.SPEED && this._stats ){
			this._stats.speed = env.SPEED
		}

		this.MODEL = init.MODEL

		this.logistic = this.logistic || []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('needs_rotate','starter_equip', 'needs_move', 'needs_stream', 'direction', 'intervals', 'MODEL', 'BODY', 'HEAD', 'ARM_LEFT', 'ARM_RIGHT', 'LEG_LEFT', 'LEG_RIGHT', 'INVENTORY', '_INVENTORY', 'bindings')

	}


	greet(){
		console.log( 'hi im a toon ! ')
	}


	set_inventory( inventory ){

		// const inv = obj ? obj.inventory : {}

		this.INVENTORY = this.INVENTORY || {}

		const init = inventory || this._INVENTORY

		for( const mud_id of Object.keys( init ) ){
			if( !this.INVENTORY[ mud_id ]){
				this.INVENTORY[ mud_id ] = new Item( init[ mud_id ])
			}
		}

		for( const mud_id of Object.keys( this.INVENTORY ) ){
			if( !init[ mud_id ]){
				console.log('item not found in init; dropping: ', mud_id, this.INVENTORY[ mud_id ])
				delete this.INVENTORY[ mud_id ]
			}
		}

		if( inventory ){
			for( let i = 0; i < this.equipped; i++ ){
				if( !this.INVENTORY[ this.equipped[ i ]]){
					ACTION_BAR.render_equip( i, false )
					// drop from action bar ..
				}
			}
		}

		POPUPS.get('inventory').render()

	}


	model( proto_map ){

		if( !proto_map ){
			debugger
		}

		const toon = this

		return new Promise(( resolve, reject ) => {

			const model = lib.identify( 'model', toon )

			const type = GLOBAL.MODEL_TYPES[ model ]

			const url  = '/resource/geometries/' + model + '.' + type
			// console.log( model )

			if( model === 'npc' || model === 'toon' ){

				// if( !proto_map[ model ] ){
					
				// 	gltfLoader.load(
				// 		url,
				// 		function ( model ) {
				// 			console.log('>>>>>', model )
				// 			proto_map[ model ] = model.scene
				// 			toon.MODEL = model.scene
				// 			toon.MODEL.traverse(function(ele){
				// 				if( ele.name.match(/_cs_/)){
				// 					ele.castShadow = true
				// 				}
				// 				toon.MODEL.userData = new Clickable( toon )
				// 			})
						
				// 			resolve( model.scene )

				// 			// gltf.animations; // Array<THREE.AnimationClip>
				// 			// gltf.scene; // THREE.Group
				// 			// gltf.scenes; // Array<THREE.Group>
				// 			// gltf.cameras; // Array<THREE.Camera>
				// 			// gltf.asset; // Object
				// 		},
				// 		function ( xhr ) {
				// 			console.log( model + ' ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
				// 		},
				// 		function ( error ) {
				// 			reject( error )
				// 		}
				// 	)

				// }else{

				// 	toon.MODEL = proto_map[ model ]
				// 	resolve( proto_map[ model ] )

				// }

				toon.MODEL = new Group()
				toon.MODEL.castShadow = true
				toon.MODEL.receiveShadow = true
				toon.MODEL.userData = new Clickable( this )
				// {
				// 	clickable: true,
				// 	mud_id: toon.mud_id,
				// 	type: 'toon',
				// 	icon_url: toon.icon_url,
				// 	// website: toon.website,
				// 	name: toon.name
				// }

				toon.BODY = new Group()
				toon.MODEL.add( toon.BODY )

				const material = new MeshLambertMaterial({
					color: new Color( toon.color )
				})

				if( env.LOCAL && 0 ){
					const gaze_geo = new BoxBufferGeometry(3, 3, 3)
					const gaze_mat = material
					toon.GAZE = new Mesh( gaze_geo, gaze_mat )
					SCENE.add( toon.GAZE )
				}

				const torso_width = 1.3
				const torso_depth = .5
				const torso_geo = new BoxBufferGeometry( torso_width, toon.height * .4, torso_depth )
				const torso = new Mesh( torso_geo, material )
				torso.position.set( 0, .55, 0 )
				toon.BODY.add( torso )

				const hip_width = 1.3
				const hip_depth = .5
				const hip_geo = new BoxBufferGeometry( hip_width, toon.height * .2, hip_depth )
				const hip = new Mesh( hip_geo, material )
				hip.position.set( 0, 0, .01 )
				toon.BODY.add( hip )

				const head_geometry = new SphereBufferGeometry( .5, 8, 6 )
				const head_material = material
				toon.HEAD = new Mesh( head_geometry, material )
				// toon.HEAD.castShadow = true
				toon.HEAD.receiveShadow = true
				toon.HEAD.position.set( 0, ( toon.height / 2 ) + .2, .1 ) 

				const arm_length = 1.5
				const arm_radius = .3
				const arm_displace_x = .75
				const arm_displace_y = (toon.height / 2) * .25
				const arm_displace_z = .12

				const arm_left = new BoxBufferGeometry( arm_radius, arm_length, arm_radius )
				const arm_material = material
				toon.ARM_LEFT = new Mesh( arm_left, arm_material )
				// toon.ARM_LEFT.castShadow = true
				toon.ARM_LEFT.receiveShadow = true
				toon.ARM_LEFT.position.set( -arm_displace_x, arm_displace_y, arm_displace_z )

				const arm_right = new BoxBufferGeometry( arm_radius, arm_length, arm_radius )
				toon.ARM_RIGHT = new Mesh( arm_right, arm_material )
				// toon.ARM_RIGHT.castShadow = true
				toon.ARM_RIGHT.receiveShadow = true
				toon.ARM_RIGHT.position.set( arm_displace_x, arm_displace_y, arm_displace_z )

				const leg_length = 1.8
				const leg_radius = .4
				const leg_displace_x = .35
				const leg_displace_y = -(toon.height / 2) * .5
				const leg_displace_z = .12

				const leg_left = new BoxBufferGeometry( leg_radius, leg_length, leg_radius )
				const leg_material = material
				toon.LEG_LEFT = new Mesh( leg_left, leg_material )
				toon.LEG_LEFT.castShadow = true
				toon.LEG_LEFT.receiveShadow = true
				toon.LEG_LEFT.position.set( -leg_displace_x, leg_displace_y, leg_displace_z )

				const leg_right = new BoxBufferGeometry( leg_radius, leg_length, leg_radius )
				toon.LEG_RIGHT = new Mesh( leg_right, leg_material )
				// toon.LEG_RIGHT.castShadow = true
				toon.LEG_RIGHT.receiveShadow = true
				toon.LEG_RIGHT.position.set( leg_displace_x, leg_displace_y, leg_displace_z )

				toon.BODY.add( toon.HEAD )
				toon.BODY.add( toon.ARM_LEFT )
				toon.BODY.add( toon.ARM_RIGHT )
				toon.BODY.add( toon.LEG_LEFT )
				toon.BODY.add( toon.LEG_RIGHT )

				resolve()

			}else{

				if( type === 'glb' ){

					if( !proto_map[ model ] ){
					
						gltfLoader.load(
							url,
							function ( model ) {
								proto_map[ model ] = model.scene
								toon.MODEL = model.scene
								toon.MODEL.traverse(function(ele){
									if( ele.name.match(/_cs_/)){
										ele.castShadow = true
									}
									toon.MODEL.userData = new Clickable( toon )
									resolve( model.scene )
								})
								// gltf.animations; // Array<THREE.AnimationClip>
								// gltf.scene; // THREE.Group
								// gltf.scenes; // Array<THREE.Group>
								// gltf.cameras; // Array<THREE.Camera>
								// gltf.asset; // Object
							},
							function ( xhr ) {
								console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
							},
							function ( error ) {
								reject( error )
							}
						)

					}else{

						toon.MODEL = proto_map[ model ]
						resolve( proto_map[ model ] )

					}

				}else if( type === 'obj' ){

					if( !proto_map[ model ] ){

						objLoader.load(
							url,
							function ( model ) {

								console.log( 'how to handle obj model: ', model )
								debugger

								// proto_map[ model ] = model.scene
								// toon.MODEL = model.scene
								// toon.MODEL.traverse(function(ele){
								// 	if( ele.name.match(/_cs_/)){
								// 		ele.castShadow = true
								// 	}
								// 	resolve( model.scene )
								// })
							},
							function ( xhr ) {
								console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
							},
							function ( error ) {
								reject( error )
							}
						)

					}else{
						toon.MODEL = proto_map[ model ]
						resolve( proto_map[ model ] )
					}

				}

			}

		})

	}



	show_health(){

		hal('health', 'toon health: ' + this.health.current, 2000 )

	}



	refresh_equipped( equipment ){

		TOON.equipped = equipment || TOON.equipped || new Array(6)

		for( let i = 0; i < TOON.equipped.length; i++ ){
			ACTION_BAR.render_equip( i, TOON.equipped[i] )
		}

		if( equipment ){ // this means it came from a transaction, not init
			MOUSE.mousehold.drop( false )
		}

	}


	look_at( vec3, direction ){

		if( direction ){

			if( direction !== TOON.direction ){

				const dir = new Vector3().copy( TOON.MODEL.position )

				// console.log( direction )

				if( direction === 'north' ){
					// dir.set( 0, 0, -1 )
					dir.z -= 1
				}else if( direction === 'east'){
					dir.x += 1
					// dir.set( 1, 0, 0 )
				}else if( direction === 'west'){
					dir.x -= 1
					// dir.set( -1, 0, 0 )
				}else if( direction === 'south'){
					dir.z += 1
					// dir.set( 0, 0, 1 )
				}else if( direction === 'northeast'){
					dir.x += 1; dir.z -= 1
					// dir.set( 10, 0, -10 )
				}else if( direction === 'northwest'){
					dir.x -= 1; dir.z -= 1
					// dir.set( -10, 0, 10 )
				}else if( direction === 'southeast'){
					dir.x += 1; dir.z += 1
					// dir.set( -1, 0, -1 )
				}else if( direction === 'southwest'){
					dir.x -= 1; dir.z += 1
					// dir.set( -10, 0, 10 )
				}
				// dir.add( this.MODEL.position )
				this.look_at( dir )

				TOON.direction = direction

			}

		}else{

			if( this.GAZE ) this.GAZE.position.copy( vec3 )

			this.BODY.lookAt( vec3 )
			// this.BODY.rotation.x = this.BODY.rotation.z = Math.PI
			RENDERER.frame( SCENE )

		}

	}




	attack( slot ){

		if( !TARGET.target )  return false

		let item_id = this.equipped[ slot ]

		let item 
		if( this.INVENTORY[ item_id ] ){
			item = this.INVENTORY[ item_id ]	
		}else{
			item = slot === 2 ? this.left_hand : this.right_hand
		} 

		// console.log( item )

		const attack = new EFFECTS.Attack({
			// type: item.type,
			item: item,
			slot: slot,
			source: this
		})
		attack.swing()

		window.SOCKET.send(JSON.stringify({
			type: 'attack',
			slot: String( slot ),
			target: {
				type: TARGET.target.type,
				mud_id: TARGET.target.mud_id
			}
		}))
	}



	animate_death( scene ){

		const toon = this

		setTimeout(function(){
			console.log( 'removing dead toon...')
			scene.remove( toon.MODEL )
		}, 1000 )

	}




	attempt_entry( mud_id ){

		SOCKET.send(JSON.stringify({
			type: 'enter_structure',
			mud_id: mud_id
		}))

	}




	begin_intervals(){

		const toon = this

		this.intervals.stream = setInterval(function(){

			// if( STATE.stream_down ){
			if( TOON.needs_stream ){

				// console.log('sending')

				if( window.SOCKET && window.SOCKET.send ){

					window.SOCKET.send(JSON.stringify({
						type: 'move_stream',
						ref: {
							position: toon.MODEL.position,
							quaternion: toon.MODEL.quaternion
						}
					}))

				}

				TOON.needs_stream = false

				DEV.render('coords', {
					packet: {
						x: TOON.MODEL.position.x,
						z: TOON.MODEL.position.z
					}
				})

			}

		}, 750 )

	}



}

