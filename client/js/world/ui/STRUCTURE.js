import CHAT from './CHAT.js'
import STATE from '../STATE.js'
import * as lib from '../../lib.js'

class StructureGUI{

	constructor( init ){
		
		init = init || {}

		this.mud_id = init.mud_id

		this.bg = document.createElement('div')
		this.bg.classList.add('structure-bg')

		this.ele = document.createElement('div')
		this.ele.classList.add('structure')
		this.close = document.createElement('div')
		this.close.innerHTML ='exit'
		this.close.classList.add('button', 'structure-exit')

		this.display = document.createElement('div')
		this.display.classList.add('structure-display')

		this.proprietor = document.createElement('div')
		this.proprietor.classList.add('display-proprietor', 'display-section')

		this.proprietor_label = document.createElement('div')
		this.proprietor_label.classList.add('proprietor-label')

		this.proprietor_name = document.createElement('div')
		this.proprietor_name.classList.add('proprietor-name')

		this.store = document.createElement('div')
		this.store.classList.add('display-store', 'display-section')

		this.store_label = document.createElement('div')
		this.store_label.classList.add('store-label')
		this.store.innerHTML = 'buy and sell:'

		this.proprietor.appendChild( this.proprietor_label )
		this.proprietor.appendChild( this.proprietor_name )
		this.store.appendChild( this.store_label )
		this.display.appendChild( this.proprietor )
		this.display.appendChild( this.store )
		this.ele.appendChild( this.display )
		this.ele.appendChild( this.close )
		this.bg.appendChild( this.ele )

		document.body.appendChild( this.bg )

		this.init()

	}

	init(){
		const structure = this
		this.close.addEventListener('click', function(){
			// document.querySelector('.structure-bg').style.display = 'none'
			structure.exit()
		})
	}

	show( structure_data ){
		// console.log('rendering', structure_data)
		this.bg.style.display = 'initial'
		document.getElementById('chat').classList.add('inside')
		this.proprietor_label.innerHTML = lib.identify( 'name', structure_data ) + ' proprietor:'
		this.mud_id = structure_data.mud_id

		if( !CHAT.toggled ){
			CHAT.ele.style.right = 'initial'
			CHAT.ele.style.left = '0%'
			CHAT.toggled = true
			CHAT.input.focus()
		}

		STATE.handler = 'structure'

		TOON.inside = this.mud_id

		CHAT.content.innerHTML = ''

	}

	exit(){

		SOCKET.send(JSON.stringify({
			type: 'exit_structure'
		}))

		this.bg.style.display = 'none'
		document.getElementById('chat').classList.remove('inside')
		STATE.handler = 'world'
		TOON.inside = false
	}

}


let structureGUI = false

export default (function(){

	if( structureGUI ) return structureGUI

	structureGUI = new StructureGUI()

	return structureGUI

})();