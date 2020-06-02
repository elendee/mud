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

	document.getElementById('forgot-password').addEventListener('click', function(){
		toggle_form()
	})

	document.getElementById('forgot-submit').addEventListener('click', function(){
		if( !document.querySelector('#forgot-form input').value.trim() ){
			hal('error', 'must provide email')
			return false
		}
		fetch('/reset', {
			method: 'post',
			headers: {
		    	'Content-Type': 'application/json'
		    },
			body: JSON.stringify({
				email: document.querySelector('#forgot-form input').value.trim(),
			})
		}).then( res => {
			res.json()
			.then( response => { 
				console.log('res: ', response )
				if( response.success ){
					hal('success', response.msg, 3000 )
				}else{
					hal('error', response.msg, 5000 )
				}
			})
		}).catch(err=>{
			console.log('mail err: ', err)
			hal('error', 'error sending mail')
		})

	})

})




function toggle_form( off ){
	if( off ){
		document.getElementById('forgot-form').style.display = 'none'
	}else{
		if( document.getElementById('forgot-form').style.display === 'initial' ){
			document.getElementById('forgot-form').style.display = 'none'
		}else{
			document.getElementById('forgot-form').style.display = 'initial'
		}
	}
}