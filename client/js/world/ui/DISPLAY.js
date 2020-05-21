import hal from '../../hal.js'
import * as lib from '../../lib.js'

import TARGET from './TARGET.js'

import {
	PlaneBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	// Color,
	// ShaderMaterial
} from '../../lib/three.module.js'

import SCENE from '../../three/SCENE.js'

import texLoader from '../../three/texLoader.js'



const flash_init_scale = 2 // approx image native render

const flash_step = 50


class Display {

	constructor( init ){

		init = init || {}

	}

	render_combat( zone, packet ){

		// type: 'combat',
		// success: true,
		// attacker: data.attacker.mud_id, 
		// attacker_health: data.attacker.health,
		// target: data.target.mud_id,
		// target_health: data.target.health,
		// target_type: data.target.type,
		// dmg: dmg

		let msg, type, target, attacker

		target = zone[ lib.entity_map[ packet.target_type ] ][ packet.target ]
		attacker = zone[ lib.entity_map[ packet.attacker_type ] ][ packet.attacker ]
		type = 'combat'

		if( packet.success ){

			// handle messaging

			if( packet.target === window.TOON.mud_id ){
				msg = lib.identify( attacker ) + ' attacks you for ' + packet.dmg
			}else if( packet.attacker === window.TOON.mud_id ){
				msg = 'You attack ' + lib.identify( target ) + ' for ' + packet.dmg
			}

			// render outcomes

			target.health.current = packet.target_health
			if( TARGET.target.mud_id === packet.target ){
				TARGET.show_status()
				if( target.health.current <= 0 ){
					flash_target( 'death_combat', zone, target.type, target.mud_id )
				}
			}else if( packet.target === window.TOON.mud_id ){
				window.TOON.show_status()
				flash_hurt()
				if( target.health.current <= 0 ){
					overlay_toon_death()
				}
			}

		}else{

			// just messaging

			if( packet.target === window.TOON.mud_id ){

				switch( packet.fail ){
					case 'range':
						msg = lib.identify( attacker ) + ' fails to reach you'
						break;
					case 'target_dead':
						msg = lib.identify( attacker ) + ' attacks the dead corpse of ' + lib.identify( target )
						break;
					default: break;
				}
			}else if( packet.attacker === window.TOON.mud_id ){
				switch( packet.fail ){
					case 'range':
						msg = 'You fail to reach ' + lib.identify( target )
						break;
					case 'target_dead':
						msg = 'You attack the dead corpse of ' + lib.identify( target )
						break;
					default: break;
				}
			}

			type = 'error'

		}

		hal( type, msg, 2000 )


	}

}

const flash_png = texLoader.load('/resource/textures/circle.png')
const flash_geo = new PlaneBufferGeometry(1, 1, 1)

function flash_target( type, zone, target_type, mud_id ){

	let target = zone[ lib.entity_map[ target_type ] ][ mud_id ]

	const flash_mat = new MeshLambertMaterial({
		color: 0xffffff,
		map: flash_png,
		transparent: true,
		opacity: 1
	})

	let flash = window.flash = new Mesh( flash_geo, flash_mat )
	flash.position.copy( target.MODEL.position )
	flash.position.y += 2
	flash.rotation.x = -Math.PI / 2

	let scale = lib.scale_to_match( flash, target.MODEL )

	flash.scale.x = scale.x * 1.1
	flash.scale.y = scale.z * 1.1

	let duration, step, fade, rise, expand
	duration = 1000
	step = 50
	fade = .05
	rise = 1
	expand = .5

	switch( type ){

		case 'death_combat':
			// step = 100
			duration = 3000
			expand = 1
			// fade = .01
			rise = .01
			if( target.type === 'flora' ){
				flash.material.color.set( 0x113311 )
			}else{
				flash.material.color.set( 0xaa0000 )
			}
			break;

		case 'cast_spell':
			flash.material.color.set( 0x660077 )
			break;

		default: break
	}

	const ticks = Math.floor( duration / step )

	flash_sequence({
		// visible: true,
		type: 'fadeout',
		flash: flash,
		duration: duration,
		// step: step,
		fade: 1 / ticks,
		rise: rise,
		expand: expand,
		ticks: ticks,
		started: false
	})
	

}
window.flash_target = flash_target


function flash_sequence( opt ){

	// visible, flash, duration, step, fade, rise, expand, ticks, started

	if( !opt.started ) SCENE.add( opt.flash )

	if( opt.duration > 0 ){
	// if( opt.duration > opt.step ){

		// visible ? SCENE.add( flash ) : SCENE.remove( flash )
		RENDERER.frame( SCENE )
		setTimeout(function(){
			// SCENE.remove( flash )
			// visible ? SCENE.add( flash ) : SCENE.remove( flash )
			RENDERER.frame( SCENE )

			// opt.duration -= opt.step 

			if( opt.fade > 0 )  opt.flash.material.opacity -= opt.fade

			if( opt.rise )  opt.flash.position.y += opt.rise

			if( opt.rise )  opt.flash.scale.x += opt.expand; opt.flash.scale.y += opt.expand

			flash_sequence({
				// visible: !opt.visible,
				flash: opt.flash,
				duration: opt.duration - flash_step,
				// step: opt.step,
				fade: opt.fade,
				rise: opt.rise,
				expand: opt.expand,
				ticks: opt.ticks - 1,
				started: false
			})

		}, flash_step )


	}else{
		SCENE.remove( flash )
		RENDERER.frame( SCENE )
	}

}


function flash_hurt(){

	const flash = document.createElement('div')
	flash.classList.add('ui-fader', 'flash-hurt')
	document.body.appendChild( flash )

	setTimeout(function(){
		flash.style.opacity = 0
	}, 10)

	setTimeout(function(){
		flash.remove()
	}, 600)

}


function overlay_toon_death(){

	const overlay = document.createElement('div')
	document.body.appendChild( overlay )
	overlay.classList.add('ui-fader', 'overlay-dead')
	overlay.style.opacity = 0
	setTimeout(function(){
		overlay.style.opacity = 1
	}, 10)

}





let display = false

export default (function(){
	if( display ) return display
	display = new Display()
	return display
})()