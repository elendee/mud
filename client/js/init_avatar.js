import hal from './hal.js'

document.addEventListener('DOMContentLoaded', function(){

	const err = document.getElementById('errors').innerHTML.trim()

	if( err )  hal('error', err )

	fetch_avatars()
	.then( res => {
		console.log( res )
		if( res.success && res.avatars ){
			render_avatars( res.avatars )
		}else{
			hal('error', res.msg )
		}
	})
	.catch( err => {
		console.log('err fetching avatars: ', err )
	})

	document.querySelector('#create form').addEventListener('submit', (e)=>{
		e.preventDefault()
		create_avatar({
			name: document.querySelector('#avatar-name').value.trim()
		})
		.then( res => {
			console.log( res )
			if( res.success && res.avatar ){
				render_avatars( [ res.avatar ] )
			}else{
				hal('error', res.msg )
			}
		})
		.catch( err => {
			console.log('err fetching avatars: ', err )
		})
	})

})


async function fetch_avatars() {

	const response = await fetch('/fetch_avatars', {
		method: 'get'
	})

	const res = await response.json()

	return res

}



async function create_avatar( data ) {

	const response = await fetch('/create_avatar', {
		method: 'post',
		headers: {
	    	'Content-Type': 'application/json'
	    },
		body: JSON.stringify({
			name: data.name
		})
	})

	const res = await response.json()

	return res

}



function render_avatars( avatars ){

	document.getElementById('avatars').innerHTML = ''

	for( const avatar of avatars ){

		const av = document.createElement('div')
		av.classList.add('avatar')
		const name = document.createElement('div')
		name.classList.add('avatar-name')
		name.innerHTML = avatar.name
		const color = document.createElement('div')
		color.classList.add('avatar-color')
		const col = 'linear-gradient( ' + avatar.color + ', transparent )'
		console.log( col )
		color.style.background = col
		av.appendChild( color )
		av.appendChild( name )
		document.getElementById('avatars').appendChild( av )
	}

}