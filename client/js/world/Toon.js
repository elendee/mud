
import * as lib from '../lib.js'
import env from '../env.js'


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

import RENDERER from '../three/RENDERER.js'

import * as ACTION_BAR from './ui/ACTION_BAR.js'
import DEV from './ui/DEV.js'
import * as MOUSE from './ui/MOUSE.js'
import * as POPUPS from './ui/POPUPS.js'

import STATE from './STATE.js'
import TOONS from './TOONS.js'
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

		// this.speed = init.speed || env.SPEED

		this.MODEL = init.MODEL

		this.logistic = this.logistic || []
		this.logistic = this.logistic.concat( init.logistic )
		this.logistic.push('needs_rotate', 'needs_move', 'needs_stream', 'intervals', 'MODEL', 'BODY', 'HEAD', 'ARM_LEFT', 'ARM_RIGHT', 'LEG_LEFT', 'LEG_RIGHT', 'INVENTORY', '_INVENTORY', 'bindings')

	}


	greet(){
		console.log( 'hi im a toon ! ')
	}


	init_inventory( inv ){

		this.INVENTORY = {}

		const init = inv || this._INVENTORY

		for( const mud_id of Object.keys( init ) ){
			this.INVENTORY[ mud_id ] = new Item( init[ mud_id ])
		}

		if( inv ){
			for( let i = 0; i < this.equipped; i++ ){
				if( !this.INVENTORY[ this.equipped[ i ]]){
					ACTION_BAR.render_equip( i, false )
					// drop from action bar ..
				}
			}
		}

		POPUPS.get('inventory').render()

	}


	model( type ){

		this.MODEL = new Group()
		this.MODEL.castShadow = true
		this.MODEL.receiveShadow = true
		this.MODEL.userData = {
			clickable: true,
			mud_id: this.mud_id,
			type: type,
			// website: this.website,
			name: this.name
		}

		this.BODY = new Group()
		this.MODEL.add( this.BODY )

		const material = new MeshLambertMaterial({
			color: new Color( this.color )
		})

		if( env.LOCAL && 0 ){
			const gaze_geo = new BoxBufferGeometry(1, 1, 1)
			const gaze_mat = material
			this.GAZE = new Mesh( gaze_geo, gaze_mat )
			SCENE.add( this.GAZE )
		}

		const torso_width = 1.3
		const torso_depth = .5
		const torso_geo = new BoxBufferGeometry( torso_width, this.height * .4, torso_depth )
		const torso = new Mesh( torso_geo, material )
		torso.position.set( 0, .55, 0 )
		this.BODY.add( torso )

		const hip_width = 1.3
		const hip_depth = .5
		const hip_geo = new BoxBufferGeometry( hip_width, this.height * .2, hip_depth )
		const hip = new Mesh( hip_geo, material )
		hip.position.set( 0, 0, .01 )
		this.BODY.add( hip )

		const head_geometry = new SphereBufferGeometry( .5, 8, 6 )
		const head_material = material
		this.HEAD = new Mesh( head_geometry, material )
		this.HEAD.castShadow = true
		this.HEAD.receiveShadow = true
		this.HEAD.position.set( 0, ( this.height / 2 ) + .2, .1 ) 

		const arm_length = 1.5
		const arm_radius = .3
		const arm_displace_x = .75
		const arm_displace_y = (this.height / 2) * .25
		const arm_displace_z = .12

		const arm_left = new BoxBufferGeometry( arm_radius, arm_length, arm_radius )
		const arm_material = material
		this.ARM_LEFT = new Mesh( arm_left, arm_material )
		this.ARM_LEFT.castShadow = true
		this.ARM_LEFT.receiveShadow = true
		this.ARM_LEFT.position.set( -arm_displace_x, arm_displace_y, arm_displace_z )

		const arm_right = new BoxBufferGeometry( arm_radius, arm_length, arm_radius )
		this.ARM_RIGHT = new Mesh( arm_right, arm_material )
		this.ARM_RIGHT.castShadow = true
		this.ARM_RIGHT.receiveShadow = true
		this.ARM_RIGHT.position.set( arm_displace_x, arm_displace_y, arm_displace_z )

		const leg_length = 1.8
		const leg_radius = .4
		const leg_displace_x = .35
		const leg_displace_y = -(this.height / 2) * .5
		const leg_displace_z = .12

		const leg_left = new BoxBufferGeometry( leg_radius, leg_length, leg_radius )
		const leg_material = material
		this.LEG_LEFT = new Mesh( leg_left, leg_material )
		this.LEG_LEFT.castShadow = true
		this.LEG_LEFT.receiveShadow = true
		this.LEG_LEFT.position.set( -leg_displace_x, leg_displace_y, leg_displace_z )

		const leg_right = new BoxBufferGeometry( leg_radius, leg_length, leg_radius )
		this.LEG_RIGHT = new Mesh( leg_right, leg_material )
		this.LEG_RIGHT.castShadow = true
		this.LEG_RIGHT.receiveShadow = true
		this.LEG_RIGHT.position.set( leg_displace_x, leg_displace_y, leg_displace_z )

		this.BODY.add( this.HEAD )
		this.BODY.add( this.ARM_LEFT )
		this.BODY.add( this.ARM_RIGHT )
		this.BODY.add( this.LEG_LEFT )
		this.BODY.add( this.LEG_RIGHT )

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

			const dir = new Vector3()

			if( direction === 'north' ){
				dir.set( 0, 0, -10 )
			}else if( direction === 'east'){
				dir.set( 10, 0, 0 )
			}else if( direction === 'west'){
				dir.set( -10, 0, 0 )
			}else if( direction === 'south'){
				dir.set( 0, 0, 10 )
			}
			dir.add( this.MODEL.position )
			this.look_at( dir )

		}else{

			if( this.GAZE ) this.GAZE.position.copy( vec3 )

			this.BODY.lookAt( vec3 )
			// this.BODY.rotation.x = this.BODY.rotation.z = Math.PI
			RENDERER.frame( SCENE )

		}

	}




	engage( slot ){

		if( !TARGET.target )  return false

		window.SOCKET.send(JSON.stringify({
			type: 'engage',
			slot: String( slot ),
			target: {
				type: TARGET.target.type,
				mud_id: TARGET.target.mud_id
			}
		}))
	}





	begin_intervals(){

		const toon = this

		this.intervals.stream = setInterval(function(){

			// if( STATE.stream_down ){
			if( TOON.needs_stream ){

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
					x: TOON.MODEL.position.x,
					z: TOON.MODEL.position.z
				})

			}

		}, 1500 )

		

	}

}

