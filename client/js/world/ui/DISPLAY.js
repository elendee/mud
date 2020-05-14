
class Display {

	constructor( init ){

		init = init || {}
		this.ele = document.getElementById('chat')
		this.input = document.getElementById('chat-input')
		this.content = document.getElementById('chat-content')

		this.chat_check = false
		this.pulse = false

		this.BUBBLES = {}

	}

}

