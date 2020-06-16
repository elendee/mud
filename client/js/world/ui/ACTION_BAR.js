import hal from '../../hal.js'
import * as lib from '../../lib.js'

import Popup from './Popup.js'
// import * as POPUPS from './POPUPS.js'
import * as MOUSE from './MOUSE.js'

import STATE from '../STATE.js'

import TARGET from './TARGET.js'

const action_bar = document.getElementById('action-bar')
let ab_buttons = []


const slot_map = ['left shoulder', 'left hip', 'left hand', 'right hand', 'right hip', 'right shoulder']
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
			
			const cooldown = document.createElement('div')
			cooldown.classList.add('cooldown-cover')
			button.appendChild( cooldown )
			
		}else {
		
			if( i === 0 || i === 5 ){
				button.classList.add('tertiary')
			}else if( i === 1 || i === 4 ){
				button.classList.add('secondary')
			}
		}

		button.addEventListener('click', function(){
			if( !MOUSE.mousehold.held.mud_id ){
				let mud_id = window.TOON.equipped[ i ]
				if( i === 2 || i === 3 ){
					if( window.TOON.equipped[ i ] ){
						MOUSE.mousehold.pickup( mud_id, 'action_bar' ) //ab_buttons[ i ].querySelector('img').src )
						console.log('action: ', this )
					}else{
						// hal('standard', 'you wave your ' + ( i === 2 ? 'left' : 'right' ) + ' hand vigorously')
						hal('standard', 'nothing to unequip there', 1500)
					}
				}else{
					if( mud_id ){
						MOUSE.mousehold.pickup( mud_id, 'action_bar' ) //ab_buttons[ i ].querySelector('img').src ) 
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
		char_pop.render_stats( window.TOON )
	}

	const inv_pop = new Popup({
		id: 'inventory',
		curX: 200, 
		curY: 100
	})
	inv_pop.render = function(){
		inv_pop.render_inventory( window.TOON.INVENTORY )
	}

	const settings_pop = new Popup({
		id: 'settings',
		curX: 250, 
		curY: 150
	})
	settings_pop.render = function(){
		settings_pop.render_settings()
	}

	// settings_wrapper.appendChild( character )

	const character_wrapper = document.createElement('div')
	character_wrapper.id = 'character-wrapper'

	const character = document.createElement('div')
	character.innerHTML = '<img src="/resource/images/icons/hood.png">'
	character.id = 'ab-character'
	character.classList.add('bar-button')
	character.addEventListener('click', function(){
		char_pop.set_visible(true)
	})

	character_wrapper.appendChild( character )

	const inventory = document.createElement('div')
	inventory.id = 'ab-inventory'
	inventory.innerHTML = '<img src="/resource/images/icons/satchel.png">'
	inventory.classList.add('bar-button')
	inventory.addEventListener('click', function(){
		inv_pop.set_visible(true)
	})

	character_wrapper.appendChild( inventory )

	// const settings_wrapper = document.createElement('div')
	// settings_wrapper.id = 'settings-wrapper'

	const settings = document.createElement('div')
	settings.innerHTML = '<img src="/resource/images/icons/settings.png">'
	settings.id = 'ab-settings'
	settings.classList.add('bar-button')
	settings.addEventListener('click', function(){
		settings_pop.set_visible( true )
		// char_pop.set_visible(true)
	})

	character_wrapper.appendChild( settings )

	action_bar.appendChild( character_wrapper )

}




function request_equip_item( i ){

	window.SOCKET.send(JSON.stringify({
		type: 'equip',
		held: MOUSE.mousehold.held,
		// MOUSE.mousehold.ele.getAttribute('data-held'),
		slot: String( i )
	}))

	MOUSE.mousehold.drop()

	// MOUSE.mousehold.ele.setAttribute('data-held', false )
	// MOUSE.mousehold.ele.querySelector('img').src = ''
	// MOUSE.mousehold.ele.style.display = 'none'

	// STATE.mousehold = false

}






function render_equip( slot, mud_id ){

	if( typeof( slot ) !== 'number' ) return false

	const img = ab_buttons[ slot ].querySelector('img')
	if( img ) img.remove()

	if( mud_id && window.TOON.INVENTORY[ mud_id ] ){
	
		let img = document.createElement('img')
		img.src = '/resource/images/icons/' +  lib.identify( 'icon', window.TOON.INVENTORY[ mud_id ] ) +'.png' // window.TOON.INVENTORY[ mud_id ].icon_url
		ab_buttons[ slot ].appendChild( img )

	}else{

		let img = ab_buttons[ slot ].querySelector('img')
		if( img ) img.remove()

	}

}




function action( slot ){

	let item_id = window.TOON.equipped[ slot ]
	let item = window.TOON.INVENTORY[ item_id ]

	if( slot === 2 || slot === 3 ){

		if( !ab_buttons[ slot ].classList.contains('cooldown') ){
			
			window.TOON.attack( slot )

			if( !item ){
				if( slot == 2 ){
					item = window.TOON.left_hand
				}else{
					item = window.TOON.right_hand
				}
			}

			render_cooldown( ab_buttons[ slot ], item.cooldown )

		}else{
			hal('standard', 'still on cooldown', 1500 )
		}

	}else{

		if( item_id ){
			let target = slot < 3 ? 2 : 3
			swap_item( slot, target )
		}else{
			hal( 'standard', 'nothing to equip on ' + slot_map[ slot ], 1000 )
		}

	}

}





function render_cooldown( button, duration ){

	button.classList.add('cooldown')
	setTimeout(function(){
		button.classList.remove('cooldown')
	}, duration )
	// setTimeout(function(){
	// 	button.classList.add('cooling'
	// )}, 5 )
	// setTimeout(function(){
	// 	button.classList.remove('cooldown')
	// }, 10 )
	// setTimeout(function(){
	// 	button.classList.remove('cooling')
	// }, duration )

}





export {
	init,
	request_equip_item,
	render_equip,
	ab_buttons,
	action
}