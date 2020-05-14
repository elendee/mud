import hal from '../hal.js'


class Display {

	constructor( init ){

		init = init || {}

	}

	render_combat( target, dmg ){

		hal('standard', 'resolving combat to ' + ( target.name || target.subtype || target.type ), 2000 )

	}

}



let display = false

default export (function(){
	if( display ) return display
	display = new Display()
	return display
})()