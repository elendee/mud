
import Popup from './Popup.js'
// import * as POPUPS from './POPUPS.js'
import * as MOUSE from './MOUSE.js'

const action_bar = document.getElementById('action-bar')
let ab_buttons = []

const char_display = ['name', 'height', 'speed']
// const inv_display = []

function init(){

	init_action_buttons()
	init_character_buttons()
	
}




function init_action_buttons(){

	const action_wrapper = document.createElement('div')
	action_wrapper.id = 'action-wrapper'

	const wrapper_liner = document.createElement('div')
	wrapper_liner.id = 'action-liner'

	for( let i = 0; i < 6; i++ ){
		const button = document.createElement('div')
		button.classList.add('bar-button', 'action-button')
		if( i === 2 || i === 3 ){
			button.classList.add('primary')
			// button.addEventListener('click', function(){
			// 	if( !STATE.mousehold ){
			// 		if( window.TOON.equipped[ i ] ){
			// 			console.log('action: ', this )
			// 		}else{
			// 			hal('standard', 'you wave your ' + ( i === 2 ? 'left' : 'right' ) + ' hand vigorously')
			// 		}
			// 	}
			// })
		}else {
			// button.addEventListener('click', function(){
			// 	if( STATE.mousehold ){
			// 		equip_item( i )
			// 	}
			// })
			if( i === 0 || i === 5 ){
				button.classList.add('tertiary')
			}else if( i === 1 || i === 4 ){
				button.classList.add('secondary')
			}
		}

		button.addEventListener('click', function(){
			if( !STATE.mousehold ){
				if( i === 2 || i === 3 ){
					if( window.TOON.equipped[ i ] ){
						console.log('action: ', this )
					}else{
						hal('standard', 'you wave your ' + ( i === 2 ? 'left' : 'right' ) + ' hand vigorously')
					}
				}else{
					let mud_id = window.TOON.equipped[ i ]
					if( mud_id ){
						pickup( mud_id, ab_buttons[ i ].querySelector('img').src ) 
						STATE.origin_hold = i
					}
				}

			}else{
				request_equip_item( i )
			}
		})
		
		wrapper_liner.appendChild( button )

		ab_buttons[ i ] = button 

	}
	action_wrapper.appendChild( wrapper_liner )

	action_bar.appendChild( action_wrapper )

}




function init_character_buttons(){

	const char_pop = new Popup({
		id: 'character'
	})
	char_pop.render = function(){

		for( const key of Object.keys( TOON )){

			if( char_display.includes( key )){

				let stat = document.createElement('div')
				stat.classList.add('stat')
				let stat_key = document.createElement('span')
				stat_key.classList.add('stat-key')
				stat_key.innerHTML = key
				stat.appendChild( stat_key )
				let stat_val = document.createElement('span')
				stat_val.classList.add('stat-val')
				stat_val.innerHTML = TOON[ key ]
				stat.appendChild( stat_val )
				
				stat.appendChild( document.createElement('br'))
				
				char_pop.content.appendChild( stat )

			}

		}

	}
	const inv_pop = new Popup({
		id: 'inventory'
	})
	inv_pop.render = function(){
		
		for( const mud_id of Object.keys( TOON.INVENTORY )){

			let item = TOON.INVENTORY[ mud_id ]

			let row = document.createElement('div')
			row.classList.add('stat')
			let icon = document.createElement('img')
			icon.classList.add('icon')
			icon.src = '/resource/images/icons/' + TOON.INVENTORY[ mud_id ].icon_url
			icon.addEventListener('click', function(){
				pickup( mud_id, icon.src )
			})
			row.appendChild( icon )
			let stat_key = document.createElement('span')
			stat_key.classList.add('stat-key')
			stat_key.innerHTML = item.name
			row.appendChild( stat_key )
			
			row.appendChild( document.createElement('br'))
			
			inv_pop.content.appendChild( row )

		}

	}

	const character_wrapper = document.createElement('div')
	character_wrapper.id = 'character-wrapper'

	const character = document.createElement('div')
	character.innerHTML = '<img src="/resource/images/icons/noun_hood.png">'
	character.id = 'ab-character'
	character.classList.add('bar-button')
	character.addEventListener('click', function(){
		char_pop.set_visible(true)
	})

	character_wrapper.appendChild( character )

	const inventory = document.createElement('div')
	inventory.id = 'ab-inventory'
	inventory.innerHTML = '<img src="/resource/images/icons/noun_satchel.png">'
	inventory.classList.add('bar-button')
	inventory.addEventListener('click', function(){
		inv_pop.set_visible(true)
	})

	character_wrapper.appendChild( inventory )

	action_bar.appendChild( character_wrapper )

}


function pickup( mud_id, src ){
	STATE.mousehold = true
	MOUSE.mousehold.style.display = 'initial'
	MOUSE.mousehold.querySelector('img').src = src
	MOUSE.mousehold.setAttribute('data-held', mud_id )
	window.addEventListener('mousemove', mousetrack )
}



function request_equip_item( i ){

	window.SOCKET.send(JSON.stringify({
		type: 'equip',
		held: MOUSE.mousehold.getAttribute('data-held'),
		slot: i + 1
	}))

	MOUSE.mousehold.setAttribute('data-held', false )
	MOUSE.mousehold.querySelector('img').src = ''
	MOUSE.mousehold.style.display = 'none'

	STATE.mousehold = false

}




function mousetrack(e){
	MOUSE.mousehold.style.top = e.clientY + 'px'
	MOUSE.mousehold.style.left = e.clientX + 'px'
}



function render_equip( slot, mud_id ){

	ab_buttons[ slot ].innerHTML = ''

	if( mud_id ){
	
		let img = document.createElement('img')
		img.src = '/resource/images/icons/' + window.TOON.INVENTORY[ mud_id ].icon_url
		ab_buttons[ slot ].appendChild( img )

	}

}

export {
	init,
	request_equip_item,
	render_equip,
	ab_buttons
}