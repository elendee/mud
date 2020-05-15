import hal from '../../hal.js'
import * as lib from '../../lib.js'

import TARGET from './TARGET.js'


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

		let msg, type

		let target = zone[ lib.entity_map[ packet.target_type ] ][ packet.target ]

		// handle messaging

		if( packet.target === window.TOON.mud_id ){
			if( packet.success ){
				type = 'combat'
				msg = lib.identify( attacker ) + ' attacks you for ' + packet.dmg
			}else{
				type = 'combat'
				msg = lib.identify( attacker ) + ' misses you'
			}
		}else if( packet.attacker === window.TOON.mud_id ){
			if( packet.success ){
				type = 'combat'
				msg = 'You attack ' + lib.identify( target ) + ' for ' + packet.dmg
			}else{
				type = 'combat'
				msg = 'You attack and miss ' + lib.identify( target )
			}
		}

		// render outcomes

		if( packet.success ){
			target.health.current = packet.target_health
			if( TARGET.target.mud_id === packet.target ){
				TARGET.show_health()
				if( packet.target.health.current <= 0 ){

				}
			}else if( packet.target === window.TOON.mud_id ){
				window.TOON.show_health()
				flash_hurt()
				if( packet.target.health.current <= 0 ){
					overlay_toon_death()
				}
			}
		}

		hal( type, msg, 2000 )


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