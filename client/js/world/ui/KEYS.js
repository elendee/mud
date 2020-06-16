
import env from '../../env.js'
import hal from '../../hal.js'

import STATE from '../STATE.js'
// import SOUND from '../../SOUND.js'

import CHAT from './CHAT.js'

import * as POPUPS from './POPUPS.js'

import BINDS from './BINDS.js'

import TARGET from './TARGET.js'

import * as ANIMATE from '../animate.js'

import * as ACTION_BAR from './ACTION_BAR.js'

import * as MOUSE from './MOUSE.js'

// const BAR = getBar()







let global_handled = false


function handle_keydown( e ){

	global_handled = false

	switch( e.which ){

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

			switch( e.which ){

				case BINDS.chat.send:
					CHAT.send_chat()
					global_handled = true
					break;

				default: break;
			}

		}else if( STATE.handler == 'world' ){

			window.TOON.needs_stream = true

			switch( e.which ){

			case BINDS.global.chat:
				CHAT.input.focus()
				break;

			case BINDS.world.move.left:
				ANIMATE.move('left', true )
				break

			case BINDS.world.move.right:
				ANIMATE.move('right', true )
				break

			case BINDS.world.move.forward: 
				ANIMATE.move('forward', true )
				break

			case BINDS.world.move.back:
				ANIMATE.move('back', true )
				break

			case BINDS.world.move_alt.forward:
				ANIMATE.move('forward', true )
				break;

			case BINDS.world.move_alt.back:
				ANIMATE.move('back', true )
				break;

			case BINDS.world.turn.left:
				ANIMATE.move('left', true)
				// ANIMATE.digital_turn('left', true )
				break;

			case BINDS.world.turn.right:
				ANIMATE.move('right', true)
				// ANIMATE.digital_turn('right', true )
				break;

			case BINDS.world.actions.one:
				break;

			case BINDS.world.actions.two:
				break;

			case BINDS.world.actions.three:
				break;

			case BINDS.world.actions.four:
				break;

			case BINDS.world.inventory:
				POPUPS.toggle('inventory')
				break;

			case BINDS.world.character:
				POPUPS.toggle('character')
				break;

			default: 
				break

			}//switch

		}else if( STATE.handler === 'structure' ){

			switch( e.which ){
				case BINDS.global.chat:
					CHAT.input.focus()
					break;

				default: break;
			}

		}

	}

}//func









function handle_keyup( e ){

	// console.log('keys', 'keyup: ', STATE.handler, e.which )
	
	global_handled = false

	switch( e.which ){

		case BINDS.global.close:
			if( MOUSE.mousehold.held.mud_id ){
				MOUSE.mousehold.drop()
			}else if( STATE.handler === 'chat' ){
				CHAT.input.blur()
			}else if( POPUPS.active.length ){
				POPUPS.active[ POPUPS.active.length - 1 ].set_visible( false )
			// }else if( STATE.handler === 'dialogue' ){
			// 	console.log('unhandled close dialgoue....')
			}else if( TARGET.target ){
				// TARGET.status_ele.style.display !== 'none' ){
				TARGET.clear( true )
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

			switch(e.which){

			case BINDS.world.move.forward:
				ANIMATE.move('forward', false)
				break

			case BINDS.world.move.back:
				ANIMATE.move('back', false)
				break

			case BINDS.world.move.left:
				ANIMATE.move('left', false)
				break

			case BINDS.world.move.right:
				ANIMATE.move('right', false)
				break

			case BINDS.world.move_alt.forward:
				ANIMATE.move('forward', false)
				break;

			case BINDS.world.move_alt.back:
				ANIMATE.move('back', false)
				break;

			case BINDS.world.turn.left:
				// ANIMATE.digital_turn('left', false)
				ANIMATE.move('left', false)
				break;

			case BINDS.world.turn.right:
				ANIMATE.move('right', false) // these should be 'move_alt', too lazy...
				// ANIMATE.digital_turn('right', false)
				break;

			// case BINDS.world.flip_cam:
			// 	flip_cam('return')
			// 	break;

			case BINDS.world.actions.one:
				ACTION_BAR.action(0)
				break;

			case BINDS.world.actions.two:
				ACTION_BAR.action(1)
				break;

			case BINDS.world.actions.three:
				ACTION_BAR.action(2)
				break;

			case BINDS.world.actions.four:
				ACTION_BAR.action(3)
				break;

			case BINDS.world.actions.five:
				ACTION_BAR.action(4)
				break;

			case BINDS.world.actions.six:
				ACTION_BAR.action(5)
				break;

			default: 
				break
			}

		}

	}

}






// let step_close

function init( zone ){

	// step_close = close_func

	document.addEventListener('keyup', handle_keyup )
	document.addEventListener('keydown', handle_keydown )

	// if( window.innerWidth < 800 ){


		// if( env.LOCAL ){
		// 	console.log('skipping mobile controls')
		// }else{
		// 	alert('mobile controls coming soon')
		// }


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
	// }

}



// function handleForward( e ){
// 	e.preventDefault()
// 	ANIMATE.move('forward')
// }

// function handleBack( e ){
// 	e.preventDefault()
// 	ANIMATE.move('back')
// }

// function handleLeft( e ){
// 	e.preventDefault()
// 	ANIMATE.move('left')
// }

// function handleRight( e ){
// 	e.preventDefault()
// 	ANIMATE.move('right')
// }

// function handleEnd( e ){
// 	e.preventDefault()
// 	STATE.rotate.right = STATE.rotate.left = STATE.move.forward = STATE.move.back = false
// 	STATE.stream_down = false
// }

// function handleCancel( e ){
// 	e.preventDefault()
// 	ANIMATE.move('cancel')
// }


function apply_user_bindings(){
	
	Object.keys( BINDS ).forEach( function( key ){
		if( window.TOON.bindings[key] && typeof( window.TOON.bindings[key] ) == 'number' ){
			BINDS[key] = window.TOON.bindings[key]
		}
	})

}




// function flip_cam( type ){
// 	if( type == 'flip' ){
// 		if( !STATE.cam_flip ){
// 			CAMERA.position.z = Math.abs( CAMERA.position.z ) 
// 			CAMERA.lookAt( window.TOON.MODEL.position )
// 			STATE.cam_flip = true
// 		}
// 	}else if( type == 'return' ){
// 		CAMERA.position.z = Math.abs( CAMERA.position.z ) * -1
// 		CAMERA.lookAt( window.TOON.MODEL.position )
// 		STATE.cam_flip = false
// 	}
// }

const keyCodes = {
	0: 'That key has no keycode',
	3: 'break',
	8: 'backspace / delete',
	9: 'tab',
	12: 'clear',
	13: 'enter',
	16: 'shift',
	17: 'ctrl',
	18: 'alt',
	19: 'pause/break',
	20: 'caps lock',
	21: 'hangul',
	25: 'hanja',
	27: 'escape',
	28: 'conversion',
	29: 'non-conversion',
	32: 'spacebar',
	33: 'page up',
	34: 'page down',
	35: 'end',
	36: 'home',
	37: 'left arrow',
	38: 'up arrow',
	39: 'right arrow',
	40: 'down arrow',
	41: 'select',
	42: 'print',
	43: 'execute',
	44: 'Print Screen',
	45: 'insert',
	46: 'delete',
	47: 'help',
	48: '0',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',
	58: ':',
	59: 'semicolon (firefox), equals',
	60: '<',
	61: 'equals (firefox)',
	63: 'ß',
	64: '@ (firefox)',
	65: 'a',
	66: 'b',
	67: 'c',
	68: 'd',
	69: 'e',
	70: 'f',
	71: 'g',
	72: 'h',
	73: 'i',
	74: 'j',
	75: 'k',
	76: 'l',
	77: 'm',
	78: 'n',
	79: 'o',
	80: 'p',
	81: 'q',
	82: 'r',
	83: 's',
	84: 't',
	85: 'u',
	86: 'v',
	87: 'w',
	88: 'x',
	89: 'y',
	90: 'z',
	91: 'Windows Key / Left ⌘ / Chromebook Search key',
	92: 'right window key',
	93: 'Windows Menu / Right ⌘',
	95: 'sleep',
	96: 'numpad 0',
	97: 'numpad 1',
	98: 'numpad 2',
	99: 'numpad 3',
	100: 'numpad 4',
	101: 'numpad 5',
	102: 'numpad 6',
	103: 'numpad 7',
	104: 'numpad 8',
	105: 'numpad 9',
	106: 'multiply',
	107: 'add',
	108: 'numpad period (firefox)',
	109: 'subtract',
	110: 'decimal point',
	111: 'divide',
	112: 'f1',
	113: 'f2',
	114: 'f3',
	115: 'f4',
	116: 'f5',
	117: 'f6',
	118: 'f7',
	119: 'f8',
	120: 'f9',
	121: 'f10',
	122: 'f11',
	123: 'f12',
	124: 'f13',
	125: 'f14',
	126: 'f15',
	127: 'f16',
	128: 'f17',
	129: 'f18',
	130: 'f19',
	131: 'f20',
	132: 'f21',
	133: 'f22',
	134: 'f23',
	135: 'f24',
	136: 'f25',
	137: 'f26',
	138: 'f27',
	139: 'f28',
	140: 'f29',
	141: 'f30',
	142: 'f31',
	143: 'f32',
	144: 'num lock',
	145: 'scroll lock',
	151: 'airplane mode',
	160: '^',
	161: '!',
	162: '؛ (arabic semicolon)',
	163: '#',
	164: '$',
	165: 'ù',
	166: 'page backward',
	167: 'page forward',
	168: 'refresh',
	169: 'closing paren (AZERTY)',
	170: '*',
	171: '~ + * key',
	172: 'home key',
	173: 'minus (firefox), mute/unmute',
	174: 'decrease volume level',
	175: 'increase volume level',
	176: 'next',
	177: 'previous',
	178: 'stop',
	179: 'play/pause',
	180: 'e-mail',
	181: 'mute/unmute (firefox)',
	182: 'decrease volume level (firefox)',
	183: 'increase volume level (firefox)',
	186: 'semi-colon / ñ',
	187: 'equal sign',
	188: 'comma',
	189: 'dash',
	190: 'period',
	191: 'forward slash / ç',
	192: 'grave accent / ñ / æ / ö',
	193: '?, / or °',
	194: 'numpad period (chrome)',
	219: 'open bracket',
	220: 'back slash',
	221: 'close bracket / å',
	222: 'single quote / ø / ä',
	223: '`',
	224: 'left or right ⌘ key (firefox)',
	225: 'altgr',
	226: '< /git >, left back slash',
	230: 'GNOME Compose Key',
	231: 'ç',
	233: 'XF86Forward',
	234: 'XF86Back',
	235: 'non-conversion',
	240: 'alphanumeric',
	242: 'hiragana/katakana',
	243: 'half-width/full-width',
	244: 'kanji',
	251: 'unlock trackpad (Chrome/Edge)',
	255: 'toggle touchpad',
}



export { 
	init,
	keyCodes
}
