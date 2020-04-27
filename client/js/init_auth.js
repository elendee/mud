import hal from './hal.js'

document.addEventListener('DOMContentLoaded', function(){

	if( localStorage.getItem('mud_auth_attempt') ){
		hal('error', 'failed to auth')
		delete localStorage.mud_auth_attempt
	}

	document.getElementById('login-form').addEventListener('submit', function( e ){
		localStorage.setItem('mud_auth_attempt', Date.now())
	})

	document.getElementById('register-form').addEventListener('submit', function( e ){
		localStorage.setItem('mud_auth_attempt', Date.now())
	})	

})


