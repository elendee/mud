
import * as lib from './lib.js'
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

	document.getElementById('enter-world').addEventListener('click', function(e){
		const avatar = localStorage.getItem('mud-active-avatar')
		if( typeof avatar !== 'string' ){
			e.preventDefault()
			hal('error', 'must choose an avatar first')
		}
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

	// document.getElementById('avatar-content').innerHTML = ''
	let names = []
	const avatar_names = document.querySelectorAll('.avatar-name')
	// const avatar_eles = document.querySelectorAll('.avatar')
	for( const name_content of avatar_names ){
		names.push( name_content.innerHTML.trim() )
	}

	for( const avatar of avatars ){

		const name = lib.get_avatar_name( avatar )

		if( !names.includes( name )){

			const av_wrap = document.createElement('div')
			av_wrap.classList.add('avatar-wrapper')
			
			const av = document.createElement('div')
			av.classList.add('avatar', 'flex-liner')
			av.addEventListener('click', function(){
				// console.log( avatar_eles )
				localStorage.setItem('mud-active-avatar', name )
				const avs = document.querySelectorAll('.avatar')
				for( const a of avs ){
					a.classList.remove('selected')
				}
				this.classList.add('selected')
			})
			av_wrap.appendChild( av )

			const name_ele = document.createElement('div')
			name_ele.classList.add('avatar-name')
			name_ele.innerHTML = name
			const color = document.createElement('div')
			color.classList.add('avatar-color')
			const col = 'linear-gradient( 165deg, ' + avatar.color + ',  transparent )'
			color.style.background = col
			
			av.appendChild( color )
			av.appendChild( name_ele )
			
			document.getElementById('avatar-content').appendChild( av_wrap )
		}
	}


}