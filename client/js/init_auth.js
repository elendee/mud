import hal from './hal.js'
import env from './env.js'

document.addEventListener('DOMContentLoaded', function(){

	const err = document.getElementById('errors').innerHTML.trim()

	if( err )  hal('error', err )

	document.getElementById('login-form').addEventListener('submit', function( e ){
		// localStorage.setItem('mud_auth_attempt', Date.now())
	})

	document.getElementById('register-form').addEventListener('submit', function( e ){
		// localStorage.setItem('mud_auth_attempt', Date.now())
	})	

	if( env.LOCAL ){

		const pt = document.getElementById('pass-through')

		// pt.addEventListener('click', function(){
		document.getElementById('login-email').value = pt.getAttribute('data-email')
		document.getElementById('login-password').value = pt.getAttribute('data-password')
		// })
	}

})


