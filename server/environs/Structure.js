const lib = require('../lib.js')
const log = require('../log.js')

const EnvironPersistent = require('./EnvironPersistent.js')



const has_proprietors = ['blacksmith', 'tavern']



class Structure extends EnvironPersistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'structure'

		this._table = 'structures'

		// this.zone_key = init.zone_key

		// this.type = init.type

		// // this._x = lib.validate_number( init.x, init._x, 0 )
		// // this._y = lib.validate_number( init.x, init._y, 0 )
		// // this._z = lib.validate_number( init.x, init._z, 0 )

		this.width = lib.validate_number( init.width, 40 )
		this.height = lib.validate_number( init.height, 40 )
		this.length = lib.validate_number( init.length, 40 )

		this.proprietor_name = init.proprietor_name
		this.proprietor_key = init.proprietor_key // indicates db or not

		this.zone_name = init.zone_name

		this.proprietor = init.proprietor

		this.orientation = lib.validate_number( init.orientation, 0 )

		this._private = lib.validate_number( init._private, init.private, false )
		this._owners = init._owners || []
		this._residents = []

		fill_proprietor( this )

	}




	async save(){

		const update_fields = [
			'name',
			'zone_key',
			'icon_url',
			'model_url',
			'subtype',
			'x',
			'y',
			'z',
			'width',
			'height',
			'length',
			'orientation'
		]

		const update_vals = [ 
			this.name, 
			this._zone_key,
			this.icon_url,
			this.model_url,
			this.subtype,
			this.ref.position.x,
			this.ref.position.y,
			this.ref.position.z,
			this.width,
			this.height,
			this.length,
			this.orientation
		]

		// if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
		// 	log('flag', 'cannot identify user for save: ', this._x, this._z, this._layer )
		// 	return false
		// }

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}












const proprietor_map = {
	'tavern': 'innkeeper',
	'blacksmith': 'blacksmith'
}

const help_messages = {
	innkeeper: `
		I've got it all, try:<br>
		quest<br>
		riddle<br>
		news<br>
		thirsty<br>
		or just chatting.
		`,
	blacksmith: `
		I provide many services, try:<br>
		quest<br>
		riddle<br>
		news<br>
		thirsty<br>
		or just chatting.
	`,
}


class Proprietor{

	constructor( init ){
		init = init || {}
		this.type = proprietor_map[ init.type ]
		this.name = init.proprietor_name || lib.capitalize( this.type ) + '_' + lib.random_hex(4)
		this.zone_name = init.zone_name
		this.color = lib.random_rgb([0,255], [0,255], [0,255])
		this.awaitings = {
			// 'a_mud_id': 'an_await_key'
		}
		this._guestbook = {
			// real_name: {
			// 	name: given_name,
			// 	last_seen: Date.now()
			// }
		}
	}



	greet( SOCKETS, toon ){

		let msg = ''

		if( !this._guestbook[ toon.mud_id ] ){
			
			this._guestbook[ toon.mud_id ] = {
				name: 'awaiting',
				last_seen: Date.now()
			}

			msg = 'hey there, what do you go by? <br>(use "/p " to respond)'

		}else{

			let name = this._guestbook[ toon.mud_id ].name
			if( !name || name === 'awaiting' ){
				name = 'stranger'
			}

			msg = 'Hello again, ' + name 

		}

		SOCKETS[ toon.mud_id ].send(JSON.stringify({
			type: 'chat',
			data: {
				method: 'say',
				speaker: this.name,
				// sender_type: 'proprietor',
				chat: msg,
				sender_mud_id: false,
				color: this.color,
			}
		}))



	}



	respond( SOCKETS, toon_id, packet, empty_room_say ){

		const proprietor = this

		const c = packet.chat.replace(/proprietor: ?/, '')

		let answer = {}

		if( empty_room_say ){

			answer.response = 'There\'s no one here, \'m afraid.  <br>(Use "/p " to speak to the proprietor)'
			answer.timeout = 1000
			answer.method = 'say'

		}else if( this._guestbook[ toon_id ].name  === 'awaiting' ){

			let name = c.trim()
			let len = name.split(' ').length
			answer.method = 'proprietor'
			answer.timeout = 1000
			if( len === 2 || len === 1 ){
				answer.response = 'Alright, ' + name + ' it is.'
				this._guestbook[ toon_id ].name = name
			}else{
				answer.response = 'I didn\'t catch that, what should I call you?'
			}

		}

		if( !answer.response ) answer = this.parse( SOCKETS, 'yes_no', toon_id, packet, c )

		if( !answer.response ) answer = this.parse( SOCKETS, 'followups', toon_id, packet, c )

		if( !answer.response ) answer = this.parse( SOCKETS, 'misc', toon_id, packet, c )

		if( !answer.response ) answer = this.parse( SOCKETS, 'greetings', toon_id, packet, c )

		if( !answer.response ) answer = this.parse( SOCKETS, 'one_offs', toon_id, packet, c )
		
		if( !answer.response ){

			answer.method = 'emote'
			answer.response = 'The ' + proprietor.type + ' furrows their brow, slightly confused. <br>(type "help" for intro)'

		}

		if( !answer.save_await ) delete this.awaitings[ toon_id ]


		setTimeout(function(){
			SOCKETS[ toon_id ].send(JSON.stringify({
				type: 'chat',
				data: {
					// sender_type: 'proprietor',
					method: answer.method,
					speaker: proprietor.name,
					// sender_mud_id: 
					chat: answer.response,
					color: proprietor.color
				}
			}))
		}, answer.timeout )


	}



	parse( SOCKETS, type, toon_id, packet, c ){

		const proprietor = this

		const answer = {
			response: false,
			method: 'say',
			timeout: Math.floor( Math.random() * 2000 ),
			save_await: false
		}

		switch( type ){

			case 'yes_no':

				if( c.match(/^y?$/i) || c.match(/^yes ?$/i) ){

					if( proprietor.awaitings[ toon_id ] ){

						let obj = proprietor.followup( proprietor.awaitings[ toon_id ] )
						answer.response = obj.response
						answer.method = obj.method
						answer.timeout = obj.timeout

					}else{
						answer.response = 'what was the question?'
					}

				}else if( c.match(/^n$/i) || c.match(/^no ?$/i) ){

					if( proprietor.awaitings[ toon_id ] ){
						answer.response = 'very well then'
					}else{
						if( Math.random() > .5 ){
							answer.response = 'no what?  Awful negative today aren\'t we.'
						}else{
							answer.response = 'Negative Nancy here I see'
						}
					}

				}

				break;

			case 'followups':

				if( c.match(/thirsty/i) ){

					answer.response = 'Would you like something to drink?'
					proprietor.awaitings[ toon_id ] = 'drink'
					answer.save_await = true

				}

			case 'misc':
					
				if( c.match(/xyzzy/i) ){

					answer.method = 'emote'
					answer.response = proprietor.name + ' pauses briefly, arching an eyebrow at you, before carrying on.'
					answer.timeout = 1000

				}else if( c.match(/^asdf$/i) ){

					answer.response = 'I\'m sorry to bore you, it\'s been a long day.'

					setTimeout(function(){
						SOCKETS[ toon_id ].send(JSON.stringify({
							type: 'chat',
							data: {
								// sender_type: 'proprietor',
								method: 'emote',
								speaker: proprietor.name,
								// sender_mud_id: 
								chat: 'The ' + proprietor.type + ' hears you drumming you fingers...',
								color: proprietor.color
							}
						}))
					}, answer.timeout - 100 )

				}

				break;


			case 'greetings':

				if( lib.chat.is_greeting( c ) ){

					answer.response = 'Good day, ' + SOCKETS[ toon_id ].request.session.USER._TOON.name + '.'

				}

				break;


			case 'one_offs': 

				if( c.match(/where am i/i)){

					if( proprietor.zone_name ){
						answer.response = 'You\'re in ' + proprietor.zone_name + '.'
					}else{
						answer.response = 'Out here, it is what you want it to be.  You\'re outland, friend.'
					}

				}else if( c.match(/have you seen/i)){

					answer.response = 'Mmm... no, no I haven\'t.'

				}else if( c.match(/i sell/i)){

					answer.response = 'We don\'t have any coin on hand for buying now, sorry.'

				}else if( c.match(/i want to buy/i) || c.match(/can i buy/i) || c.match(/what'?s for sale/i) || c.match(/what have you got/i) ){

					answer.response = 'Sorry, the pandemic has run us out of supplies...  check back soon.'

				}else if( c.match(/^thanks/i) || c.match(/^thank you/i) ){

					answer.response = 'anytime'

				}else if( c.match(/^help/i) ){

					answer.response = help_messages.innkeeper

				}else if( c.match(/^news/i)){

					answer.response = proprietor.recount_guestbook()

				}else if( c.match(/^riddle/i)){

					answer.response = 'Well.. I need to work on that actually.'

				}else if( c.match(/^quest$/i)){

					answer.response = 'We\'ve got this tremendous chest of gold, but nothing to award it for at the moment, sadly.'

				}

				break;

			default: break;

		}

		return answer


	}



	recount_guestbook(){

		if( !Object.keys( this._guestbook ).length || Object.keys( this._guestbook ).length <= 1 ){
			return 'There hasn\'t been anyone by in quite some time, until now.'
		}else{
			let visitors = ''
			for( const toon_id of Object.keys( this._guestbook ) ){
				if( Date.now() - this._guestbook[ toon_id ].name > 1000 * 60 * 60 ){
					delete this._guestbook[ toon_id ]
				}else{
					visitors += this._guestbook[ toon_id ].name + '<br>'
				}
			}
			return 'We\'ve had about ' + Object.keys( this._guestbook ).length + ' visitors in the past hour or so. They called themselves:<br>' + visitors + ''
		}

	}



	followup( key, toon_id ){

		let response = ''
		let method = 'say'
		let timeout = 1000

		switch( key ){
			case 'quest':
				response = 'I don\'t have any quests currently, sorry'
				break;
			case 'drink':
				response = this.name + ' slides you an ale'
				method = 'emote'
				break;
			default: 
				response = 'scratches their head, "sorry, I forgot what I was doing there..."'
				method = 'emote'
				break;
		}

		return { response, method, timeout }

	}
}




function fill_proprietor( structure ){

	if( has_proprietors.includes( structure.subtype ) ){
		structure.proprietor = new Proprietor({
			type: structure.subtype,
			name: structure.proprietor_name,
			zone_key: structure.zone_key,
			zone_name: structure.zone_name,
		})
	}else{
		log('flag', 'wtf: ', has_proprietors, structure.subtype )
	}

}





module.exports = Structure