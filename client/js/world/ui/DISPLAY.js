import hal from '../../hal.js'
import lib from '../../lib.js'


class Display {

	constructor( init ){

		init = init || {}

	}

	render_combat( zone, packet ){

		let target = zone[ lib.entity_map[ packet.type ]][ packet.target ]

		hal('standard', 'resolving combat to ' + ( target.name || target.subtype || target.type ), 2000 )

	}

}



let display = false

export default (function(){
	if( display ) return display
	display = new Display()
	return Display
})()