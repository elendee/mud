import env from '../../env.js'
import * as lib from '../../lib.js'

import STATE from '../STATE.js'

import RENDERER from '../../three/RENDERER.js'
import CAMERA from '../../three/CAMERA.js'

import GLOBAL from '../../GLOBAL.js'

import {
	Vector3
} from '../../lib/three.module.js'


// const say = new RegExp(/^\/s/i)
const methods = {
	say: /^\/s /i,
	yell: /^\/y /i,
	whisper: /^\/w /i,
	proprietor: /^\/p /i,
	help: /^\/h /i,
	emote: /^\/e /i,
}


const help_menu = `
include space after command key:<br>
/h - Help<br>
/s - Say<br>
/y - Yell<br>
/w - Whisper<br>
/e - Emote<br>
/p - Speak to proprietor if available - NPC's inside structures.  Proprietor chats are private.<br>
`

class Chat {

	constructor( init ){

		init = init || {}
		this.ele = document.getElementById('chat')
		this.input = document.getElementById('chat-input')
		this.content = document.getElementById('chat-content')
		this.toggle_ele = document.getElementById('chat-toggle')

		this.chat_check = false
		this.pulse = false

		this.BUBBLES = {}

		this.toggled = true

	}


	toggle(){

		const chat = this

		if( chat.toggled ){
			chat.ele.style.right = '100%'
			chat.ele.style.left = 'initial'
			chat.toggled = false
			chat.input.blur()
		}else{
			chat.ele.style.right = 'initial'
			chat.ele.style.left = '0%'
			chat.toggled = true
			chat.input.focus()
		}

	}

	init(){

		const chat = this

		chat.toggle_ele.addEventListener('click', ()=>{
			chat.toggle()
		})

		chat.input.addEventListener('blur', ()=>{
			STATE.handler = 'world'
		})

		chat.input.addEventListener('focus', ()=>{
			console.log('focus chat')
			STATE.handler = 'chat'
		})

		chat.input.addEventListener('keyup', ()=>{
			chat.parse_command( chat.input.value )
		})

	}



	parse_command( value ){
		if( value.match( methods.say ) ){
			value = value.replace( methods.say, 'say: ')
		}else if( value.match( methods.whisper ) ){
			value = value.replace( methods.whisper, 'whisper: ')
		}else if( value.match( methods.yell ) ){
			value = value.replace( methods.yell, 'yell: ')
		}else if( value.match( methods.proprietor ) ){
			value = value.replace( methods.proprietor, 'proprietor: ')
		}else if( value.match( methods.help ) ){
			value = value.replace( methods.help, 'press enter for help menu: ')
		}else if( value.match( methods.emote ) ){
			value = value.replace( methods.emote, 'emote: ')
		}

		chat.input.value = value
	}



	parse_type( value ){
		for( const key of Object.keys( methods )){
			if( value.match( key + ':' ) ) return key
		}
		return 'none'
	}

	


	add_chat( zone, data ){

		// type
		// method
		// sender_type (proprietors)
		// sender_mud_id
		// speaker
		// chat
		// color

		const CHAT = this		

		const chat = document.createElement('div')
		chat.classList.add('chat')
		// chat.classList.add( data.method )
		if( data.sender_mud_id == window.TOON.mud_id )  chat.classList.add('self')			
		if( data.method === 'emote' ){ 
			chat.innerHTML = data.chat
		}else{
			let prefix 
			if( data.method === 'proprietor' ){
				prefix = 'to proprietor: '
			}else{
				prefix = data.method + 's: '
			}
			if( data.google ){
				let res = '<br>'
				data.results.forEach((r)=>{
					res += '<a class="" href="https://www.google.com/' + r.link + '" target="_blank" rel="noreferrer noopener">' + r.text.substr(0, 75) + '</a><br>'
				})
				chat.innerHTML = `<span class="speaker" style="color: ${ data.color }">${ data.speaker }: </span><span class='${ data.method }'>${ prefix }${ res }</span>`
			}else{
				chat.innerHTML = `<span class="speaker" style="color: ${ data.color }">${ data.speaker }: </span><span class='${ data.method }'>${ prefix }${ data.chat }</span>`
			}
		}

		this.content.appendChild( chat )

		this.content.scroll( 0, 9999 )

		const chats = document.getElementsByClassName('chat')
		const diff = chats.length - 50
		for( let i = 0; i < diff; i++ ){
			chats[ 0 ].remove()
		}

		if( !TOON.inside && zone ){

			if( !zone.NPCS[ data.sender_mud_id ] && !zone.TOONS[ data.sender_mud_id ] && window.TOON.mud_id !== data.sender_mud_id ){
				console.log('no toon found for chat ', data.sender_mud_id )
				return false
			}

			const bubble = new Bubble( data )

			setTimeout(function(){
				bubble.update_position( zone.TOONS, zone.NPCS )
			}, 50)

			this.BUBBLES[ bubble.hash ] = bubble

			setTimeout(function(){
				bubble.ele.remove()
				delete CHAT.BUBBLES[ bubble.hash ]
			}, 6000 )
			
		}

	}



	send_chat(){

		const chat = this

		const val = chat.input.value.trim()

		if( val && val != '' ){

			if( val.length > 240 ) {
				hal('hal', '240 character max', 3000 )
				return false
			}

			const method = chat.parse_type( val )

			if( val.match(/^press enter for help menu:/) || val.match(/^\/h$/) ){
				chat.add_chat(false, {
					method: 'emote',
					sender_mud_id: TOON.mud_id, 
					speaker: lib.identify('name', TOON),
					chat: help_menu,
				})
				chat.input.value = ''
				return true
			}

			if( method === 'proprietor' ){
				if( TOON.inside ){
					chat.add_chat(false, {
						// type:
						method: 'proprietor',
						sender_mud_id: TOON.mud_id, 
						// sender_type
						speaker: lib.identify('name', TOON),
						chat: val.replace('proprietor: ', ''),
						color: TOON.primary_color
					})
				}else{
					hal('error', 'you must be in a structure', 2000 )
					chat.input.value = ''
					return false
				}
			}

			if( val.match(/^\// ) ){ 

				// filter commands before send

			}else if( method === 'none' ){
				chat.add_chat(false, {
					// type:
					method: 'emote',
					sender_mud_id: TOON.mud_id, 
					// sender_type
					speaker: lib.identify('name', TOON),
					chat: 'You think to yourself .. ' + val,
					color: TOON.primary_color
				})
				chat.input.value = ''
				return true
			}

			let pack = JSON.stringify({
				type: 'chat',
				method: method,
				// method: 'say',
				chat: val
			})

			chat.input.value = ''

			window.SOCKET.send( pack )
		}

	}


	begin_pulse( zone ){

		const CHAT = this

		CHAT.chat_check = setInterval(function(){

			if( Object.keys( CHAT.BUBBLES ).length ){

				CHAT.pulse = setInterval(function(){

					for( const hash of Object.keys( CHAT.BUBBLES ) ){
						CHAT.BUBBLES[ hash ].update_position( zone.TOONS, zone.NPCS )
					}

				}, 150 )

				// console.log( CHAT.pulse )

			}else{

				// console.log( CHAT.pulse )

				if( CHAT.pulse ){
					clearInterval( CHAT.pulse )
					CHAT.pulse = false
				}
			}

		}, 2000)

	}

}






class Bubble {

	constructor( init ){

		init = init || {}

		this.type = init.type
		this.hash = lib.random_hex( 6 )
		this.method = init.method
		this.sender_mud_id = init.sender_mud_id
		this.speaker = init.speaker
		this.chat = init.chat
		this.color = init.color

		this.ele = document.createElement('div')
		this.ele.classList.add('chat-bubble')
		this.ele.style.color = this.color
		// <span>${ this.speaker }:</span>
		this.ele.innerHTML = `${ this.chat }`
		document.body.appendChild( this.ele )

		this.bound = false

		this.posX = 0
		this.posY = 0
		// this.overhang_b = 0
		// this.overhang_l = 0

	}

	update_position( toons, npcs ){

		let vector
		if( this.sender_mud_id == window.TOON.mud_id ){
			vector = new Vector3().copy( window.TOON.BBOX.position )
		}else if( toons[ this.sender_mud_id ] && toons[ this.sender_mud_id ].BBOX ){
			vector = new Vector3().copy( toons[ this.sender_mud_id ].BBOX.position )
		}else if( npcs[ this.sender_mud_id ] && npcs[ this.sender_mud_id ].BBOX ){
			vector = new Vector3().copy( npcs[ this.sender_mud_id ].BBOX.position )
		}else{
			console.log('no model found for chat ', this.sender_mud_id )
			return false
		}

		const canvas = RENDERER.domElement

		const scalarX = canvas.width / window.innerWidth
		const scalarY = canvas.height / window.innerHeight
		// GLOBAL.RES_MAP[ GLOBAL.RES_KEY ]

		vector.project( CAMERA )
		vector.x = Math.round( ( vector.x + 1 ) * canvas.width  / 2 )
		// vector.x = Math.round( ( vector.x + 1 ) * scalar )
		vector.y = Math.round( ( -vector.y + 1 ) * canvas.height / 2 )
		// vector.y = Math.round( ( -vector.y + 1 ) * scalar )
		// vector.y = 0
		vector.z = 0;
		// vector.z = Math.round( ( - vector.z + 1 ) * canvas.height / 2 )

		this.posX = Math.floor( vector.x / scalarX ) + 5
		this.posY = Math.floor( vector.y / scalarY ) - 5
		// this.posY = vector.z //- 30

		this.bound = this.ele.getBoundingClientRect()


		if( this.posX + this.bound.width > window.innerWidth ){
			this.ele.style.left = 'auto'
			this.ele.style.right = '0px'
		}else{
			this.ele.style.left = this.posX + 'px'
			this.ele.style.right = 'auto'
		}

		if( this.posY > window.innerHeight ){
			this.ele.style.top = 'auto'
			this.ele.style.bottom = '0px'
		}else{
			this.ele.style.bottom = ( window.innerHeight - this.posY ) + 'px'
			this.ele.style.top = 'auto'
		}
		
	}



}






let chat = false

export default (function(){

	if( chat ) return chat

	chat = new Chat()

	return chat

})()
