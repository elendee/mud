class Game {

	constructor( init ){

		init = init || {}

		this.opening = false

		this.pulse = false

		this.move_pulse = false

		this.census = false

		this.growth = false

		this.bot_pulse = false

	}



	async init_async_elements(){

		

	}



	init_sync_elements(){

	

	}




	handle_chat( packet, mud_id ){

		if( packet.chat.match(/^\/.*/)){
			this.handle_command( packet, mud_id )
			return true
		}

		if( packet.chat == 'xyzzy'){
			SOCKETS[ mud_id ].send( JSON.stringify({
				type: 'zoom'
			}))
			return true
		}

		for( const socket_mud_id of Object.keys( SOCKETS )){
			let chat_pack = {
				type: 'chat',
				method: packet.method,
				sender_mud_id: mud_id,
				speaker: SOCKETS[ mud_id ].request.session.PATRON.name,
				chat: lib.sanitize_chat( packet.chat ),
				color: SOCKETS[ mud_id ].request.session.PATRON.color
			}
			log('chat', chat_pack.speaker, chat_pack.chat )
			SOCKETS[ socket_mud_id ].send(JSON.stringify( chat_pack ))
		}

	}

}


let game = false

module.exports = (function(){
	if( game ) return game

	game = new Game()

	return game

})()