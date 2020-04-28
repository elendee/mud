
import env from '../../env.js'

import STATE from '../STATE.js'
// import SOUND from '../../SOUND.js'

import CHAT from './CHAT.js'

// import * as DIALOGUE from './DIALOGUE.js'
// import * as POPUP from './POPUP.js'

// import * as HUD from './HUD.js'
// import { getBar } from './ACTION_BAR.js'

import BINDS from './BINDS.js'


// const BAR = getBar()







let global_handled = false


function handle_keydown( e ){

	global_handled = false

	switch( e.keyCode ){

		case 17:
			STATE.ctrlKey = true
			break;

		case 16:
			STATE.shiftKey = true
			break;

		default: break;
	}

	if( !global_handled ){

		if( STATE.handler == 'chat' ){

			switch( e.keyCode ){

				case BINDS.chat.send:
					CHAT.send_chat()
					global_handled = true
					break;

				default: break;
			}

		}else if( STATE.handler == 'world' ){

			window.TOON.needs_stream = true

			switch( e.keyCode ){

			case BINDS.global.chat:
				CHAT.input.focus()
				break;

			case BINDS.world.move.left:
				STATE.move.left = true
				STATE.stream_down = true
				break

			case BINDS.world.move.right:
				STATE.move.right = true
				STATE.stream_down = true
				break

			case BINDS.world.move.forward: 
				STATE.move.forward = true
				STATE.stream_down = true
				break

			case BINDS.world.move.back:
				STATE.move.back = true
				STATE.stream_down = true
				break

			case BINDS.world.move_alt.forward:
				STATE.move.forward = true
				STATE.stream_down = true
				break;

			case BINDS.world.move_alt.back:
				STATE.move.back = true
				STATE.stream_down = true
				break;

			case BINDS.world.turn.left:
				STATE.rotate.left = true
				STATE.stream_down = true
				break;

			case BINDS.world.turn.right:
				STATE.rotate.right = true
				STATE.stream_down = true
				break;

			case BINDS.world.flip_cam: 
				flip_cam('flip')
				break;

			case BINDS.world.actions.one:
				break;

			case BINDS.world.actions.two:
				break;

			case BINDS.world.actions.three:
				break;

			case BINDS.world.actions.four:
				break;

			default: 
				break

			}//switch

		}

	}

}//func









function handle_keyup( e ){

	// console.log('keys', 'keyup: ', STATE.handler, e.keyCode )
	
	global_handled = false

	switch( e.keyCode ){

		case BINDS.global.close:
			// HUD.step_close()
			if( STATE.handler == 'chat' ){
				CHAT.input.blur()
			}else{
				DIALOGUE.close_all()
				// document.getElementById('info-panel').style.display = 'none'
			}
			global_handled = true
			break;

		case 17:
			STATE.ctrlKey = false
			break;

		case 16:
			STATE.shiftKey = false
			break;

		default: break;
	}

	if( !global_handled ){

		if( STATE.handler == 'chat' ){

		}else if( STATE.handler == 'world' ){

			switch(e.keyCode){

			case BINDS.world.move.forward:
				STATE.move.forward = false
				check_stream()
				break

			case BINDS.world.move.back:
				STATE.move.back = false
				check_stream()
				break

			case BINDS.world.move.left:
				STATE.move.left = false
				check_stream()
				break

			case BINDS.world.move.right:
				STATE.move.right = false
				check_stream()
				break

			case BINDS.world.move_alt.forward:
				STATE.move.forward = false
				check_stream()
				break;

			case BINDS.world.move_alt.back:
				STATE.move.back = false
				check_stream()
				break;

			case BINDS.world.turn.left:
				STATE.rotate.left = false
				check_stream()
				break;

			case BINDS.world.turn.right:
				STATE.rotate.right = false
				check_stream()
				break;

			case BINDS.world.flip_cam:
				flip_cam('return')
				break;

			case BINDS.world.actions.one:
				break;

			case BINDS.world.actions.two:
				break;

			case BINDS.world.actions.three:
				break;

			case BINDS.world.actions.four:
				break;

			default: 
				break
			}

		}

	}

}








function init(){

	document.addEventListener('keyup', handle_keyup )
	document.addEventListener('keydown', handle_keydown )

	if( window.innerWidth < 800 ){


		if( env.LOCAL ){
			console.log('skipping mobile controls')
		}else{
			alert('mobile controls coming soon')
		}


		// const mcf = document.getElementById('mc-forward');
		// mcf.addEventListener("touchstart", handleForward, false);
		// mcf.addEventListener("touchend", handleEnd, false);
		// mcf.addEventListener("touchcancel", handleCancel, false);

		// const mcb = document.getElementById('mc-back');
		// mcb.addEventListener("touchstart", handleBack, false);
		// mcb.addEventListener("touchend", handleEnd, false);
		// mcb.addEventListener("touchcancel", handleCancel, false);

		// const mcl = document.getElementById('mc-left');
		// mcl.addEventListener("touchstart", handleLeft, false);
		// mcl.addEventListener("touchend", handleEnd, false);
		// mcl.addEventListener("touchcancel", handleCancel, false);

		// const mcr = document.getElementById('mc-right');
		// mcr.addEventListener("touchstart", handleRight, false);
		// mcr.addEventListener("touchend", handleEnd, false);
		// mcr.addEventListener("touchcancel", handleCancel, false);
		// mcf.addEventListener("touchmove", handleMove, false);
	}

}



function handleForward( e ){
	e.preventDefault()
	STATE.move.forward = true
	STATE.stream_down = true
	window.TOON.needs_stream = true
}

function handleBack( e ){
	e.preventDefault()
	STATE.move.back = true
	STATE.stream_down = true	
	window.TOON.needs_stream = true
}

function handleLeft( e ){
	e.preventDefault()
	
	STATE.rotate.left = true
	STATE.stream_down = true
	window.TOON.needs_stream = true
}

function handleRight( e ){
	e.preventDefault()
	
	STATE.rotate.right = true
	STATE.stream_down = true	
	window.TOON.needs_stream = true
}

function handleEnd( e ){
	e.preventDefault()
	STATE.rotate.right = STATE.rotate.left = STATE.move.forward = STATE.move.back = false
	STATE.stream_down = false
}

function handleCancel( e ){
	e.preventDefault()
	STATE.rotate.right = STATE.rotate.left = STATE.move.forward = STATE.move.back = false
	STATE.stream_down = false
}


function apply_user_bindings(){
	
	Object.keys( BINDS ).forEach( function( key ){
		if( window.TOON.bindings[key] && typeof( window.TOON.bindings[key] ) == 'number' ){
			BINDS[key] = window.TOON.bindings[key]
		}
	})

}



function check_stream(){
	if( !STATE.move.forward && !STATE.move.back && !STATE.move.left && !STATE.move.right ){
		STATE.stream_down = false
	}
}


function flip_cam( type ){
	if( type == 'flip' ){
		if( !STATE.cam_flip ){
			CAMERA.position.z = Math.abs( CAMERA.position.z ) 
			CAMERA.lookAt( window.TOON.MODEL.position )
			STATE.cam_flip = true
		}
	}else if( type == 'return' ){
		CAMERA.position.z = Math.abs( CAMERA.position.z ) * -1
		CAMERA.lookAt( window.TOON.MODEL.position )
		STATE.cam_flip = false
	}
}




export { 
	init,
}
