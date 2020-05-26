import env from '../../env.js'
import * as lib from '../../lib.js'
import hal from '../../hal.js'

import STATE from '../STATE.js'
import GLOBAL from '../../GLOBAL.js'

import CHAT from './CHAT.js'

import { 
	Vector3 
} from '../../lib/three.module.js'

import NPCS from '../NPCS.js'

import CAMERA from '../../three/CAMERA.js'
import RAYCASTER from '../../three/RAYCASTER.js'
import RENDERER from '../../three/RENDERER.js'
import SCENE from '../../three/SCENE.js'

import * as ANIMATE from '../animate.js'

import * as POPUPS from './POPUPS.js'




const buttons = [ 'left', 'middle', 'right' ]

const clickable_types = ['toon', 'npc', 'self', 'flora', 'structure', 'item']

let lastX = -1
let lastY = -1
let distX = 0
let distY = 0

let clearance, toon_offset, new_height, mousehold

const toToon = new Vector3()
const wheel_projection = new Vector3()

// const head_pos = new Vector3()
let zone

function init( ZONE ){

	zone = ZONE

	RENDERER.domElement.addEventListener('mousedown', click_down )
	RENDERER.domElement.addEventListener('mouseup', click_up )
	RENDERER.domElement.addEventListener('contextmenu', click_down )
	RENDERER.domElement.addEventListener('mousemove', mouse_move )
	RENDERER.domElement.addEventListener('mousewheel', wheel )

	mousehold = (function(){
		if( mousehold ) return mousehold
		mousehold = window.MOUSEHOLD = new MouseHold()
		return mousehold
	})()

	document.body.appendChild( mousehold.ele )

}



function click_down( e ){

	STATE.mousedown[ buttons[ e.button ] ] = true

	if( mousehold.held.mud_id ){

		let on_inventory = false
		let on_action_bar = false

		if( !on_inventory && !on_action_bar ){

			mousehold.drop( 'unequip' )

		}else{

			// button listeners should handle these

		}

	}else{

		if( STATE.handler == 'chat' )  CHAT.input.blur()

		if( e.button !== 2 )  detect_object_clicked( e, zone )		
	
	}



	e.preventDefault()

}

function click_up( e ){

	STATE.mousedown[ buttons[ e.button ] ] = false

	if( e.button == 2 )  lastX = lastY = -1

	ANIMATE.analog_turn( false )

	for( const popup of POPUPS.active ){
		popup.mousedown = false
	}

}

function mouse_move( e ){

	if( STATE.mousedown.right || ( STATE.mousedown.left && STATE.shiftKey )){

		console.log('no more mouse look')
	// 	if( lastX == -1 ){
	// 	}else{

	// 		distX = e.clientX - lastX
	// 		distY = e.clientY - lastY

	// 	}

	// 	orient_patron( distX, distY, e )

	// 	lastX = e.clientX
	// 	lastY = e.clientY
	}

}

function orient_patron( x, y, e ){

	if( e.clientY > window.innerHeight / 2 )  x *= -1

	ANIMATE.analog_turn( ( x / 100 ), true )
	// window.TOON.MODEL.rotation.y -= ( x / 100 )
	// adjust_camera_altitude( y )
	// window.TOON.needs_stream = true

}



function wheel( e ){

	if( STATE.stream_down || STATE.mousedown.left || STATE.mousedown.right || STATE.mousedown.middle )  return false

	toToon.subVectors( GLOBAL.ORIGIN, CAMERA.offset ).normalize().multiplyScalar( 5.5 )

	if( e.wheelDelta < 0 ) toToon.multiplyScalar( -1 )

	wheel_projection.copy( CAMERA.offset ).add( toToon )

	if( e.wheelDelta > 0 ){

		let dist = wheel_projection.distanceTo( GLOBAL.ORIGIN )
		if( dist > ( env.MIN_CAM || GLOBAL.MIN_CAM ) + 5 ){
			CAMERA.offset.add( toToon )
		}

	}else{

		let dist1 = wheel_projection.distanceTo( GLOBAL.ORIGIN )
		let dist2 = env.MAX_CAM || GLOBAL.MAX_CAM


		if( dist1 < dist2 && wheel_projection.y > 0 - ( window.TOON.height / 2 ) ){
			CAMERA.offset.add( toToon )
		}else{
		}

	}

	CAMERA.position.copy( window.TOON.MODEL.position ).add( CAMERA.offset )

	CAMERA.lookAt( window.TOON.MODEL.position )

	RENDERER.frame( SCENE )

}











function detect_object_clicked( e, ZONE ){

	e.preventDefault();

	const x = ( ( e.clientX / window.innerWidth ) * 2 - 1 )
	const y = ( ( e.clientY / window.innerHeight ) * 2 - 1 ) * -1

	RAYCASTER.setFromCamera({
		x: x, 
		y: y
	}, CAMERA )

	const intersects = RAYCASTER.intersectObjects( SCENE.children, true ) //, true ) // [ objects ], recursive (children) (ok to turn on if needed)

	if( intersects.length > 0 ) { // 1 = skybox

		// console.log( intersects[0].object )

		let clicked = false
		for( const int of intersects ){
			clicked = recurse_for( 'clickable', int.object )
			if( clicked ) break
		}

		// console.log('intersects length: ', intersects.length )

		if( clicked ){

			// console.log('instanceId - ', clicked.instanceId )

			// console.log('what????', clicked.userData )

			if( !check_distance( clicked, intersects ) ){
				hal('error', 'too far', 2000 )
				return false
			}

			if( clickable_types.includes( clicked.userData.type )){

				ZONE.set_target( clicked )

			}else{

				console.log('unknown click type: ', clicked.userData.type )

			}

		}else{

			// DIALOGUE.close_all()
		}

	}else{
		// DIALOGUE.close_all()
	}
 
}





function check_distance( clicked, intersects ){

	let dist, clicked_position, required_dist
	let type = clicked.userData.type

	if( type == 'toon' ){

		clicked_position = new Vector3().copy( clicked.position )
		required_dist = MAP.TARGET_DIST * 2

		return true

	}else{

		console.log('unhandled click type: ', type )
		return true
		
	}

	dist = clicked_position.distanceTo( window.TOON.MODEL.position )

	if( dist < required_dist )  return true

	return false

}











function recurse_for( type, search ){

	if( !search ) return false

	// let search = Object.assign( {}, obj )

	if( type === 'clickable' ){

		if( check_clickable( search ) ) return search

		for( let i = 0; i < 15; i++ ){

			if( !search.parent ) return false

			if( check_clickable( search.parent ) ) return search.parent
			search = search.parent 

		}
		return false

	}
	// else if( type === 'pillar' ){

	// 	if( check_pillar( search ) ) return search

	// 	for( let i = 0; i < 15; i++ ){

	// 		if( !search.parent ) return false

	// 		if( check_pillar( search.parent ) ) return search.parent
	// 		search = search.parent 

	// 	}
	// 	return false

	// }

}

// function check_pillar( obj ){
// 	if( obj.parent.type && typeof( obj.parent.type ) === 'string' && obj.parent.type.match(/scene/i) ){
// 		return obj
// 	}else{
// 		return false
// 	}
// }


function check_clickable( obj ){
	if( obj && obj.userData && obj.userData.clickable ){
		// if( DIALOGUE.TARGET.entity && DIALOGUE.TARGET.entity.mud_id === obj.mud_id ) return false
		return obj
	}else{
		return false
	}
}





class MouseHold {

	constructor( init ){
		init = init || {}
		this.ele = document.createElement('div')
		this.ele.id = 'mousehold'
		this.held = {
			mud_id: false,
			origin: false
		}
		// this.ele.setAttribute('data-held', false )
		this.hold_img = document.createElement('img')
		this.ele.appendChild( this.hold_img )		
	}

	pickup( mud_id, origin_type ){
		
		this.ele.style.display = 'initial'

		let group

		if( origin_type === 'zone' ){
			group = zone.ITEMS
		}else{
			group = window.TOON.INVENTORY
		}
		this.hold_img.src = '/resource/images/icons/' + lib.identify( 'icon', group[ mud_id ] ) + '.png' 

		this.held = {
			mud_id: mud_id,
			origin: origin_type
		}
		// this.ele.setAttribute('data-held', mud_id )
		window.addEventListener('mousemove', mousetrack )
		const ev = new CustomEvent('mousemove'); // just render icon in right place ...
		ev.initEvent('resize');
		window.dispatchEvent(ev); 

		document.body.classList.add('mousehold')

	}

	drop( type, TARGET ){

		if( type === 'unequip' ){
			if( mousehold.held.mud_id ){
				let held = window.TOON.INVENTORY[ mousehold.held.mud_id ]
				let skip = false
				if( mousehold.held.origin === 'inventory' && held ){
					if( !confirm('Destroy ' + ( held.name || held.subtype || held.type ) + '?') )  skip = true
				}
				if( !skip ){
					window.SOCKET.send(JSON.stringify({
						type: 'drop',
						held: mousehold.held
					}))
				}
			}
		}else if( type === 'acquire' ){
			if( zone.ITEMS[ this.held.mud_id ] ){
				if( window.TOON.INVENTORY[ this.held.mud_id ] ){
					hal('alert', 'it seems you already have that item')
				}else{
					// you funny
					// server side foo
					window.SOCKET.send(JSON.stringify({
						type: 'acquire',
						mud_id: this.held.mud_id
					}))

					// window.TOON.INVENTORY[ this.held.mud_id ] = zone.ITEMS[ this.held.mud_id ]
					// POPUPS.get('inventory').render()
					// const mesh = SCENE.get_mud_id( this.held.mud_id )
					// console.log( mesh )
					// SCENE.remove( mesh )
					// TARGET.clear()
					// delete zone.ITEMS[ this.held.mud_id ]
					// RENDERER.frame( SCENE )
				}
			}
		}

		this.ele.style.display = 'none'
		this.hold_img.src = ''
		this.held = {
			mud_id: false,
			origin: false
		}
		// this.ele.setAttribute('data-held', false )
		window.removeEventListener('mousemove', mousetrack )

		document.body.classList.remove('mousehold')

	}

}


function mousetrack(e){
	mousehold.ele.style.top = e.clientY + 5 + 'px'
	mousehold.ele.style.left = e.clientX + 'px'
}






















export {
	init,
	// bind,
	// unbind,
	click_down,
	click_up,
	detect_object_clicked,
	recurse_for,
	check_clickable,
	mousehold
}