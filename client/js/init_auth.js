import hal from './hal.js'

document.addEventListener('DOMContentLoaded', function(){

	const err = document.getElementById('errors').innerHTML.trim()

	if( err )  hal('error', err )

	document.getElementById('login-form').addEventListener('submit', function( e ){
		// localStorage.setItem('mud_auth_attempt', Date.now())
	})

	document.getElementById('register-form').addEventListener('submit', function( e ){
		// localStorage.setItem('mud_auth_attempt', Date.now())
	})	

})


