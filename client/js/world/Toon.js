
import * as lib from '../lib.js'
import env from '../env.js'
import MAP from '../MAP.js'
import GLOBAL from '../GLOBAL.js'

import Clickable from './Clickable.js'

import { 
	Box3,
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

		// if( !this._stats ){
		// 	console.log('invalid toon; no _stats')
		// 	return false
		// }

		this.speed = lib.validate_number( this.speed, init.speed, 0 )

		// this._stats.speed = this._stats.speed || env.SPEED

		this.type = init.type || 'toon'

		this.bindings = this.bindings || {}

		this.INVENTORY = false // instantiated inventory
		// this._INVENTORY // server inventory

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

		this.MODEL = init.MODEL
		this.BBOX = init.BBOX

		this.logistic = this.logistic || []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('needs_rotate','starter_equip', 'needs_move', 'needs_stream', 'direction', 'intervals', 'BBOX', 'MODEL', 'BODY', 'HEAD', 'ARM_LEFT', 'ARM_RIGHT', 'LEG_LEFT', 'LEG_RIGHT', 'INVENTORY', '_INVENTORY', 'bindings')

	}


	greet(){
		console.log( 'hi im a toon ! ')
	}


	set_inventory( inventory ){

		// const inv = obj ? obj.inventory : {}

		this.INVENTORY = this.INVENTORY || {}

		const init = inventory || this._INVENTORY

		console.log('setting inventory: ', inventory )

		for( const mud_id of Object.keys( init ) ){ // fill new
			if( !this.INVENTORY[ mud_id ]){
				this.INVENTORY[ mud_id ] = new Item( init[ mud_id ])
			}
		}

		for( const mud_id of Object.keys( this.INVENTORY ) ){ // clear unrepresented
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
			console.log('missing proto map', lib.identify('name', this ))
			return false
		}

		const toon = this

		return new Promise(( resolve, reject ) => {

			const toon_address = lib.identify( 'model', toon )

			const url  = '/resource/geometries/' + toon_address + '.glb' // + type

			if( !proto_map[ toon_address ] ){

				console.log('prototyping: ', toon_address )
				
				gltfLoader.load(
					url,
					function ( toon_address ) {
						// console.log('>>>>>', toon_address )
						proto_map[ toon_address ] = toon_address.scene
						
						toon.MODEL = toon_address.scene

						toon.MODEL.traverse(function(ele){
							// console.log( ele.name )
							if( ele.name.match(/_cs_/)){
								ele.castShadow = true
							}
							if( ele.name.match(/_rs_/)){
								ele.receiveShadow = true
							}
							if( ele.name.match(/HEAD/)){
								toon.MODEL.HEAD = ele
							}
							if( ele.name.match(/_mat/)){
								let slug = ele.name.substr( ele.name.indexOf('_mat') + 5 ).replace(/_.*/g, '')
								// console.log('assigning material: ', slug )
								if( lib.materials[ slug ] ){
									ele.material = lib.materials[ slug ]
								}else{
									console.log('missing material: ', slug )
								}
							}
						})

						toon.inflate()

						const bbox = new Box3().setFromObject( toon.MODEL ).getSize()
						const upper_bound_width = Math.max( bbox.x, bbox.z )
						const bbox_geo = new BoxBufferGeometry( 
							upper_bound_width, 
							bbox.y, 
							upper_bound_width 
						)

						toon.BBOX = new Mesh( bbox_geo, lib.materials.transparent )
						toon.BBOX.userData = new Clickable( toon )

						toon.BBOX.add( toon.MODEL )

						toon.BBOX.position.y = 0 // toon.height / 2

						resolve()

						// gltf.animations; // Array<THREE.AnimationClip>
						// gltf.scene; // THREE.Group
						// gltf.scenes; // Array<THREE.Group>
						// gltf.cameras; // Array<THREE.Camera>
						// gltf.asset; // Object
					},
					function ( xhr ) {
						// console.log( model + ' ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
					},
					function ( error ) {
						reject( error )
					}
				)

			}else{

				toon.MODEL = proto_map[ toon_address ]
				const bbox = new Box3().setFromObject( toon.MODEL ).getSize()
				const upper_bound_width = Math.max( bbox.x, bbox.z )
				const bbox_geo = new BoxBufferGeometry( 
					upper_bound_width, 
					bbox.y, 
					upper_bound_width 
				)
				toon.BBOX = new Mesh( bbox_geo, lib.materials.transparent )
				resolve( toon.MODEL )

			}
			
		})

	}



	inflate(){

		const bbox = new Box3().setFromObject( this.MODEL ).getSize()

		const ratio = this.height / bbox.y

		this.MODEL.scale.set( ratio, ratio, ratio )

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

				const dir = new Vector3().copy( TOON.BBOX.position )

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

			// if( this.GAZE ) this.GAZE.position.copy( vec3 )

			// this.BODY.lookAt( vec3 )
			this.MODEL.lookAt( vec3 )
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
			scene.remove( toon.BBOX )
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
							position: toon.BBOX.position,
							quaternion: toon.MODEL.quaternion
						}
					}))

				}

				TOON.needs_stream = false

				DEV.render('coords', {
					packet: {
						x: TOON.BBOX.position.x,
						z: TOON.BBOX.position.z
					}
				})

			}

		}, 750 )

	}



}

