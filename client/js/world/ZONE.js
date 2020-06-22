import * as lib from '../lib.js'
import env from '../env.js'
import hal from '../hal.js'

import SCENE from '../three/SCENE.js'
import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'
import * as LIGHT from '../three/LIGHT.js'
import {
	dirt 
} from '../three/GROUND.js'


import GLOBAL from '../GLOBAL.js'
// import TOONS from './TOONS.js'
import Toon from './Toon.js'
// import Npc from './Npc.js'

import * as ANIMATE from './animate.js'

import DEV from './ui/DEV.js'

// import BuffGeoLoader from '../three/BuffGeoLoader.js'
import * as SHADERS from './env/shaders.js'

import Item from './Item.js'

import grass_mesh from './env/grass_mesh.js'

import * as KEYS from './ui/KEYS.js'
import * as MOUSE from './ui/MOUSE.js'
import CHAT from './ui/CHAT.js'
import * as EFFECTS from './ui/EFFECTS.js'
import TARGET from './ui/TARGET.js'

import Popup from './ui/Popup.js'

import Flora from './env/Flora.js'
import Structure from './env/Structure.js'

import STRUCTURE from './ui/STRUCTURE.js'


// import DIALOGUE from './'


import {
	Geometry,
	Vector2,
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
	ShaderMaterial,
	Box3
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

		this.entity_proto_map = {}
		this.toon_proto_map = {}

	}

	async initialize(){

		KEYS.init( this )
		MOUSE.init( this )
		CHAT.init()
		TARGET.popup = new Popup({
			id: 'inspector',
			curX: 150, 
			curY: 20
		})
		TARGET.popup.render = TARGET.popup.render_target
		// DIALOGUE.init()

		const TOON = window.TOON

		await TOON.model( this.toon_proto_map )
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

		CHAT.begin_pulse( this )

		if( env.EXPOSE ) window.CAMERA = CAMERA

	}











	begin_intervals(){

		const zone = this

		const moving_toons = window.moving_toons = ANIMATE.moving_toons

		zone.intervals.anim_sweeper = setInterval(function(){

			for( const mud_id of moving_toons ){
				if( !zone.TOONS[ mud_id ]) moving_toons.splice( moving_toons.indexOf( mud_id ), 1 )
			}
			for( const mud_id of ANIMATE.rotating_toons ){
				if( !zone.TOONS[ mud_id ]) ANIMATE.rotating_toons.splice( ANIMATE.rotating_toons.indexOf( mud_id ), 1 )
			}

		}, 10000 )

		// zone.intervals.dist_sweeper = setInterval(function(){ // toggle off movement (and animation) for 'out of frame's

		// 	let removes = []

		// 	for( const mud_id of moving_toons ){

		// 		if( mud_id === TOON.mud_id ) continue

		// 		if( zone.TOONS[ mud_id ] ){
		// 			if( zone.TOONS[ mud_id ].MODEL.position.distanceTo( TOON.MODEL.position ) > 150 ){
		// 				zone.TOONS[ mud_id ].needs_move = false
		// 				if( moving_toons.indexOf( mud_id ) > -1 )  removes.push( mud_id )
		// 			}else{
		// 				zone.TOONS[ mud_id ].needs_move = true
		// 				if( moving_toons.indexOf( mud_id ) < 0 )  moving_toons.push( mud_id )
		// 			}
		// 		}

		// 		if( zone.NPCS[ mud_id ] ){
		// 			if( zone.NPCS[ mud_id ].MODEL.position.distanceTo( TOON.MODEL.position ) > 150 ){
		// 				zone.NPCS[ mud_id ].needs_move = false
		// 				if( moving_toons.indexOf( mud_id ) > -1 )  removes.push( mud_id )
		// 			}else{
		// 				zone.NPCS[ mud_id ].needs_move = true
		// 				if( moving_toons.indexOf( mud_id ) < 0 )  moving_toons.push( mud_id )
		// 			}
		// 		}

		// 	}

		// 	for( const r of removes ){
		// 		// console.log( 'removing ', r )
		// 		moving_toons.splice( moving_toons.indexOf( r ), 1 )
		// 	}

		// 	// DEV.render('movers', moving_toons )
		// 	// console.log('mvoing toons: ', moving_toons.length )

		// }, 2000 )

		if( env.LOCAL ){

			zone.intervals.dev = setInterval(function(){

				SOCKET.send(JSON.stringify({
					type: 'dev_ping'
				}))

			}, 2000 )

		}

	}









	async prototype_entities( type, group ){

		// const zone = this

		const model_inits = []
		let entity, entity_address, model_type, base_class, color

		switch( type ){

			case 'flora':

				base_class = Flora

				// group = zone_data._FLORA

				color = 'rgb(10, 20, 5)'

				break;

			case 'structures':

				base_class = Structure

				// group = zone_data._STRUCTURES

				color = 'rgb(65, 55, 45)'

				break;

			default: break;

		}

		for( const mud_id of Object.keys( group ) ){  // iterating to prototype each UNIQUE model 

			entity = group[ mud_id ]

			if( entity.subtype ){

				entity_address = entity.type + '_' + entity.subtype

				// console.log( 'ead: ', entity_address)

				model_type = GLOBAL.MODEL_TYPES[ entity_address ];      if( !model_type ){ console.log( 'invalid model type: ', entity_address); continue }

				if( !this.entity_proto_map[ entity_address ] || !this.entity_proto_map[ entity_address ].model ){  ///// prototype models
					
					this.entity_proto_map[ entity_address ] = {}
					this.entity_proto_map[ entity_address ].model = 'awaiting'
					this.entity_proto_map[ entity_address ].type = model_type

					const proto_model = new base_class( entity )
					model_inits.push( proto_model.proto({
							proto_map: zone.entity_proto_map,
							address: entity_address
						}) 
					)

				}

				if( model_type === 'obj' && !this.entity_proto_map[ entity_address ].material ){ ///// prototype materials

					// this.entity_proto_map[ entity_address ].material = new ShaderMaterial({
					// 	uniforms: SHADERS.uniforms,
					// 	fragmentShader: SHADERS.sampleFragment(),
					// 	vertexShader: SHADERS.baseVertexShader(),
					// 	// clipping: true,
					// 	// lights: true
					// })
					if( entity.type === 'flora' ){
						if( entity.subtype === 'oak' ){
							color  = 'rgb( 18, 20, 5)'
						}else if( entity.subtype === 'pine' ){
							color = 'rgb(10, 20, 5)'
						}
					}

					this.entity_proto_map[ entity_address ].material = new MeshLambertMaterial({
						color: color
					})


				}
				// else{
					// console.log('no material requested for: ', entity_address )
				// }

			}

		}

		// const meshes = 
		await Promise.all( model_inits )

		return true

	}




	async render_flora( floras ){

		await this.prototype_entities( 'flora', floras )

		this.instantiate_entities( 'FLORA', floras, Flora )

	}


	async render_structures( structures_data ){

		await this.prototype_entities( 'structures', structures_data )

		this.instantiate_entities( 'STRUCTURES', structures_data, Structure )

	}


	render_items( items_data ){

		for( const mud_id of Object.keys( items_data )){
			// console.log( 'render item: ', item[ mud_id ] )
			if( !this.ITEMS[ mud_id ]){
				this.ITEMS[ mud_id ] = new Item( items_data[ mud_id ] )
				this.ITEMS[ mud_id ].model()
				SCENE.add( this.ITEMS[ mud_id ].MODEL )
			}

		}

		SCENE.traverse(( obj ) => {
			if( obj.userData && obj.userData.mud_id && obj.userData.type === 'item' ){
				if( !items_data[ obj.userData.mud_id ] ){
					console.log('removing _dep item')
					SCENE.remove( obj )
				}
			}
		})

	}




	async instantiate_entities( dest_group, source_group, base_class ){

		// if( !this.count )  this.count = 0

		for( const mud_id of Object.keys( source_group )){

			// this.count++

			// if( this.count >  50 ) return true

			const entity = new base_class( source_group[ mud_id ])

			const model_key = entity.type + '_' + entity.subtype

			let proto_mesh = this.entity_proto_map[ model_key ].model
			let proto_material = this.entity_proto_map[ model_key ].material

			

			if( proto_mesh ){

				entity.model({ 
					address: model_key,
					proto_map: this.entity_proto_map,
					// proto_mesh: proto_mesh,
					// proto_material: proto_material
				})

			}else{
				console.log('no prototype found for: ', model_key )
			}

			this[ dest_group ][ entity.mud_id ] = entity

			if( !entity.MODEL ){
				console.log('failed to make model: ', lib.identify( 'generic', entity ))
				return false
			}

			entity.MODEL.position.set( entity.ref.position.x, entity.ref.position.y, entity.ref.position.z )

			if( entity.type === 'structure' ){

				entity.MODEL.rotation.y = entity.orientation
				
				const structure_dirt = dirt.clone()
				const bbox_source = new Box3().setFromObject( entity.MODEL ).getSize()

				structure_dirt.scale.x = ( bbox_source.x / 10 ) * 1.2 // 10 == standard size..
				structure_dirt.scale.y = ( bbox_source.z  / 10 ) * 1.2

				structure_dirt.position.copy( entity.MODEL.position )
				structure_dirt.position.y += 1
				structure_dirt.receiveShadow = true
				SCENE.add( structure_dirt )

				if( !window.structure_dirts ) window.structure_dirts = []
				window.structure_dirts.push( structure_dirt )
				
			}

			SCENE.add( entity.MODEL )

		}

		RENDERER.frame( SCENE )

	}



	handle_entry( data ){
		if( data.success ){
			if( data.toon_id === TOON.mud_id ){
				TARGET.clear()
				// console.log( data )
				STRUCTURE.show( this.STRUCTURES[ data.structure_id ] )
			}else{
				
				console.log('remove toon for entry..')	
			}
		}else{
			hal( 'error', data.msg, 3000 )
		}
		TARGET.structure_ele.src = '/resource/images/icons/key.png'
	}



	handle_npc_move( packet ){

		const zone = this

		for( const mud_id of Object.keys( packet ) ){

			if( !zone.NPCS[ mud_id ] ){

				console.log('requesting npc: ', mud_id )

				window.SOCKET.send(JSON.stringify({
					type: 'npc_ping',
					mud_id: mud_id
				}))

			}else{

				// console.log( 'movin toon: ', packet )

				// console.log('updating patron pos: ', mud_id )
				needs_move = needs_rotate = false

				// if( !NPCS[ mud_id ] ) console.log('wtf: ', NPCS[ mud_id ] )
				new_pos = packet[ mud_id ].position
				// new_quat = packet[ mud_id ].quaternion
				old_pos = this.NPCS[ mud_id ].ref.position
				// old_quat = this.NPCS[ mud_id ].ref.quaternion

				if( new_pos.x !== old_pos.x || new_pos.y !== old_pos.y || new_pos.z !== old_pos.z )  needs_move = true
				// if( new_quat._x !== old_quat._x || new_quat._y !== old_quat._y || new_quat._z !== old_quat._z || new_quat._w !== old_quat._w )  needs_rotate = true

				if( needs_move ){

					old_pos.set(
						new_pos.x,
						new_pos.y,
						new_pos.z
					)

				}

				// if( needs_rotate ){

				// 	old_quat.set( 
				// 		new_quat._x,
				// 		new_quat._y,
				// 		new_quat._z,
				// 		new_quat._w
				// 	)

				// }

				if( needs_move ){
					// if( zone.NPCS[ mud_id ].MODEL.position.distanceTo( TOON.MODEL.position ) < 150 ){
					 ANIMATE.receive_move( mud_id )
					// }
					this.NPCS[ mud_id ].needs_move = needs_move
				}
				// if( needs_rotate ) ANIMATE.receive_rotate()

				// this.NPCS[ mud_id ].needs_rotate = Number( needs_rotate ) * 400

			}

		}

		for( const mud_id of Object.keys( zone.NPCS )){

			if( !packet[ mud_id ] && zone.NPCS[ mud_id ] ){
				zone.remove_npc({
					mud_id: mud_id 
				})
			}

		}

	}



	handle_move( packet ){

		const zone = this

		for( const mud_id of Object.keys( packet ) ){

			if( window.TOON.mud_id !== mud_id ){

				if( !zone.TOONS[ mud_id ] ){

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
					old_pos = this.TOONS[ mud_id ].ref.position
					old_quat = this.TOONS[ mud_id ].ref.quaternion

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

					this.TOONS[ mud_id ].needs_move = needs_move
					this.TOONS[ mud_id ].needs_rotate = Number( needs_rotate ) * 400

				}

			}else{

				// console.log('skipping self data in move pulse')

			}

		}

	}


	async touch_toon( toon_data ){

		if( toon_data ){
			if( this.TOONS[ toon_data.mud_id ] ){
				// update
			}else{
				this.TOONS[ toon_data.mud_id ] = new Toon( toon_data )

				await this.TOONS[ toon_data.mud_id ].model( this.toon_proto_map )
				// .catch( err=> { console.log('err modeling: ', err )})
				
				SCENE.add( this.TOONS[ toon_data.mud_id ].MODEL )
				this.TOONS[ toon_data.mud_id ].MODEL.position.copy( this.TOONS[ toon_data.mud_id ].ref.position )
				// set(
				// 	this.TOONS[ toon_data.mud_id ].ref.position.x,
				// 	this.TOONS[ toon_data.mud_id ].ref.position.y,
				// 	this.TOONS[ toon_data.mud_id ].ref.position.z
				// )

				RENDERER.frame( SCENE )

			}
		}

	}





	apply_resolution( type, resolution ){

		console.log( 'resolution: ', resolution )

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

			if( target.mud_id === TOON.mud_id ){
				STATE.handler = 'dedders'
				document.getElementById('dedders').style.display = 'initial'
			}

		}

		this.render_resolution_flash( target, attacker, resolution )

		this.render_resolution_text( target, attacker, resolution )

		if( TARGET.target && TARGET.target.mud_id === resolution.target_id ){
			TARGET.show_status()
		}

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



	touch_npc( data ){

		console.log('adding npc: ', data )

		this.NPCS[ data.mud_id ] = new Toon( data )
		this.NPCS[ data.mud_id ].type = 'npc'
		this.NPCS[ data.mud_id ].model( this.toon_proto_map )
		.then( res => {
			this.NPCS[ data.mud_id ].MODEL.position.copy( this.NPCS[ data.mud_id ].ref.position )
			SCENE.add( this.NPCS[ data.mud_id ].MODEL )
		})

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

		if( msg ) hal( type, msg, 2000 )

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




	set_target( clicked ){

		TARGET.set( this, clicked )

	}


	remove_item( data ){

		const mesh = SCENE.get_mud_id( data.mud_id )
		SCENE.remove( mesh )
		TARGET.clear()
		delete zone.ITEMS[ data.mud_id ]
		RENDERER.frame( SCENE )

	}


	remove_toon( data ){

		if( TARGET.target.mud_id === data.mud_id ) TARGET.clear()
		SCENE.remove( this.TOONS[ data.mud_id ].MODEL )
		delete this.TOONS[ mud_id ]
		RENDERER.frame( SCENE )

	}

	remove_npc( data ){

		if( TARGET.target && TARGET.target.mud_id === data.mud_id ) TARGET.clear()
		SCENE.remove( this.NPCS[ data.mud_id ].MODEL )
		delete this.NPCS[ data.mud_id ]
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

