
import Popup from './Popup.js'
import POPUPS from './POPUPS.js'

const action_bar = document.getElementById('action-bar')

function init(){

	init_action_buttons()
	init_character_buttons()
	
}


function init_character_buttons(){

	const char_pop = new Popup({
		id: 'character'
	})
	const inv_pop = new Popup({
		id: 'inventory'
	})

	const character_wrapper = document.createElement('div')
	character_wrapper.id = 'character-wrapper'

	const character = document.createElement('div')
	character.id = 'ab-character'
	character.classList.add('bar-button')
	character.addEventListener('click', function(){
		POPUPS['character'].show()
		// console.log(this.id + ' clicked')
	})

	character_wrapper.appendChild( character )

	const inventory = document.createElement('div')
	inventory.id = 'ab-inventory'
	inventory.classList.add('bar-button')
	inventory.addEventListener('click', function(){
		POPUPS['inventory'].show()
		// console.log(this.id + ' clicked')
	})

	character_wrapper.appendChild( inventory )

	action_bar.appendChild( character_wrapper )

}




function init_action_buttons(){
	const action_wrapper = document.createElement('div')
	action_wrapper.id = 'action-wrapper'

	for( let i = 0; i < 4; i++ ){
		const button = document.createElement('div')	
		button.classList.add('bar-button', 'action-button')
		button.addEventListener('click', function(){
			console.log('ab ' + i + ' clicked')
		})
		action_wrapper.appendChild( button )
	}
	action_bar.appendChild( action_wrapper )
}




export {
	init
}