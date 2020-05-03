import env from './env.js'

// import GLOBAL from '../GLOBAL.js'

// import MAP from '../MAP.js'

if( env.EXPOSE ) window.hal = hal

export default function hal( type, msg, time, redirect ){

	if( !type || ( type !== 'error' && type !== 'success' && type !== 'npc' ) ) type = 'standard'

	const alert = document.createElement('div')
	const alert_message = document.createElement('div')
	const close = document.createElement('div')

	close.innerHTML = 'X'
	close.classList.add('alert-close')

	// if( type === 'hal' ){
	// 	const msgs = document.getElementsByClassName('hal')
	// 	for( let m of msgs )  m.remove()
	// }else if( type === 'error' ) {
	// 	document.getElementById('spinner').classList.add('hidden')
	// }else{
	// }

	// am.innerHTML = `<div class='alert-icon type-${ type }'>${ icon }</div>${ msg }`
	alert_message.innerHTML = msg 
	// a.classList.add('alert-wrap')
	alert.classList.add('ui-fader')
	alert_message.classList.add('alert-msg', type )
	alert_message.appendChild( close )
	alert.appendChild( alert_message )

	document.getElementById('alert-contain').appendChild( alert )

	// console.log( document.getElementById('alert-contain').innerHTML , '<<<<')


	close.onclick = function(){
		alert.style.opacity = 0
		setTimeout(function(){
			alert.remove()
		}, 500)
	}

	if( time ){
		setTimeout(function(){
			alert.style.opacity = 0
			if( redirect ){
				location.assign( redirect )
			}
			setTimeout(function(){
				alert.remove()
			}, 500)
		}, time )
	}

	
}


