
// const mud_read = require('../mud_read.js')

const node_fetch = require('node-fetch')

const { deflate, unzip } = require('zlib')

const DB = require('../db.js')

const lib = require('../lib.js')
const log = require('../log.js')


const EnvironPersistent = require('./EnvironPersistent.js')
const Persistent = require('../Persistent.js')

const mud_parser = require('../mud_parser.js')



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











class GuestEntry extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}
		this.moniker = init.moniker
		this.last_seen = lib.validate_number( init.last_seen )
		this.message = init.message || ''

	}
	
}









const proprietor_map = {
	'tavern': 'innkeeper',
	'blacksmith': 'blacksmith'
}

const help_messages = {
	innkeeper: `
		I've got it all, try asking me for:<br>
		news [topic]<br>
		url [url]<br>
		guestbook<br>
		quest<br>
		riddle<br>
		thirsty<br>
		or just chatting.<br>
		Type "message [message]", to leave a note in the guestbook for a couple days.  280 chars.
		`,
	blacksmith: `
		I provide many services, try asking me for:<br>
		news [topic]<br>
		quest<br>
		riddle<br>
		thirsty<br>
		or just chatting.
	`,
}


class Proprietor{

	constructor( init ){

		init = init || {}
		this.type = proprietor_map[ init.type ]
		this.name = init.proprietor_name || lib.capitalize( this.type ) + '_' + lib.random_hex(4)
		this._structure_key = init._structure_key
		this.zone_name = init.zone_name
		this.color = lib.random_rgb( [0,255], [0,255], [0,255] )
		this.awaitings = {
			// 'a_mud_id': 'an_await_key'
		}
		this._guestbook = {}
		this.get_guestbook()

	}


	async get_guestbook(){

		if( !this._structure_key ){
			log('flag', 'proprietor missing structure')
			return {}
		}

		const pool = DB.getPool()

		const sql = 'SELECT * FROM guestbook WHERE structure_key=' + this._structure_key

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error ){
			log('flag', error )
			return {}
		}
		if( !results ){
			log('structure', 'no guests for: ', this._structure_key )
		}
		for( const result of results ){
			log('structure', 'guest result: ', result )
			this._guestbook[ result.id ] = new GuestEntry( result )
		}

		return true

	}



	async save_guestbook(){

		if( !Object.keys( this._guestbook ).length ) return true

		if( !this._structure_key ){
			log('flag', 'p missing structure')
			return false
		}

		let value_string = 'first'
		let guest
		const deletes = []

		const pool = DB.getPool()

		for( const mud_id of Object.keys( this._guestbook ) ){

			guest = this._guestbook[ mud_id ]

			if( typeof Number( guest.last_seen ) !== 'number' ) continue

			if( Math.abs( guest.last_seen ) - Date.now() > GLOBAL.GUESTBOOK_TIME ){
				if( typeof guest._id === 'number' )  deletes.push( guest._id )
				continue
			}

			if( !guest.moniker ) continue

			const msg = guest.message ? guest.message : 'NULL'

			const current_string = '(' + ( guest._id || 'NULL' ) + ', ' + this._structure_key + ', ' + pool.escape( guest.moniker ) + ', ' + guest.last_seen + ', ' + pool.escape( msg ) + ')'

			if( value_string === 'first' ){
				value_string = current_string
			}else{
				value_string = value_string + ', ' + current_string
			}
		}

		if( value_string === 'z' ) return true

		if( deletes.length > 50 )  await this.clean_guestbook( pool, deletes )

		const sql = 'INSERT INTO `guestbook` ( id, structure_key, moniker, last_seen, message ) VALUES ' + value_string + ' ON DUPLICATE KEY UPDATE structure_key = VALUES( structure_key ), moniker = VALUES( moniker ), last_seen = VALUES( last_seen ), message = VALUES( message );'

		log('structure', 'attempting guestbook: ', value_string )

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error || !results ){
			log('flag', error || 'no results from save_guestbook' )
			return false
		}

		return true

	}




	async clean_guestbook( pool, deletes ){

		// log('flag', '\n\nSKIPPING GUESTBOOK CLEAN FOR STRUCTURE: ' + this._structure_key + '\n\n')
		if( !deletes ) return false

		let delete_string = deletes[0]
		for( let i = 1; i < deletes.length; i++ ) delete_string += ', ' + deletes[i]

		const sql = 'DELETE * FROM guestbook WHERE id IN (' + delete_string + ')'

		const { error, results, fields } = await pool.queryPromise( sql )
		if( error || !results ){
			log('flag', error || 'failed to delete any guestbook entries' )
			return false
		}

		log('structure', 'deleted guestbook entries', results )

		return true

	}




	greet( SOCKETS, toon ){

		let msg = ''

		if( !this._guestbook[ toon.mud_id ] ){
			
			this._guestbook[ toon.mud_id ] = new GuestEntry({
				moniker: 'awaiting',
				last_seen: Date.now()
			})

			msg = 'hey there, what do you go by? <br>(use "/p [message]" to respond)'

		}else{

			let moniker = this._guestbook[ toon.mud_id ].moniker
			if( !moniker || moniker === 'awaiting' ){
				moniker = 'stranger'
			}

			msg = 'Hello again, ' + moniker 

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



	async respond( SOCKETS, toon, packet, empty_room_say ){

		const proprietor = this

		const c = packet.chat.replace(/proprietor: ?/, '')

		let answer = {}

		if( empty_room_say ){

			answer.response = 'There\'s no one here, \'m afraid.  <br>(Use "/p " to speak to the proprietor)'
			answer.timeout = 1000
			answer.method = 'say'

		}else if( this._guestbook[ toon.mud_id ].moniker  === 'awaiting' ){

			let moniker = c.trim()
			let len = moniker.split(' ').length
			answer.method = 'say'
			answer.timeout = 1000
			// if( len === 2 || len === 1 ){
			if( len === 1 ){
				answer.response = 'Alright, ' + moniker + ' it is.'
				this._guestbook[ toon.mud_id ].moniker = moniker
			}else{
				answer.response = 'I didn\'t catch that, what should I call you? (single nickname)'
			}

		}

		if( !answer.response ) answer = await this.parse( SOCKETS, 'one_offs', toon, packet, c )

		if( !answer.response ) answer = await this.parse( SOCKETS, 'yes_no', toon, packet, c )

		if( !answer.response ) answer = await this.parse( SOCKETS, 'followups', toon, packet, c )

		if( !answer.response ) answer = await this.parse( SOCKETS, 'misc', toon, packet, c )

		if( !answer.response ) answer = await this.parse( SOCKETS, 'greetings', toon, packet, c )
		
		if( !answer.response ){

			answer.method = 'emote'
			answer.response = 'The ' + proprietor.type + ' furrows their brow, slightly confused. <br>(type "help" to the proprietor for intro)'

		}

		if( !answer.save_await ) delete this.awaitings[ toon.mud_id ]


		setTimeout(function(){
			SOCKETS[ toon.mud_id ].send(JSON.stringify({
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



	async parse( SOCKETS, type, toon, packet, c ){

		const toon_id = toon.mud_id

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

				}else if( c.match(/^asdf$/i) ){

					answer.response = 'I\'m sorry to bore you, it\'s been a long day.'

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

				}

				break;


			case 'greetings':

				if( lib.chat.is_greeting( c ) ){

					answer.response = 'Good day, ' + ( proprietor._guestbook[ toon_id ] ? proprietor._guestbook[ toon_id ].moniker : 'stranger' ) + '.'

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

				}else if( c.match(/^guestbook/)){

					answer.response = proprietor.recount_guestbook( toon )

				}else if( c.match(/^riddle/i)){

					answer.response = 'Well.. I need to work on that actually.'

				}else if( c.match(/^news ?/)){

					answer.method = 'emote'

					let topic = typeof c === 'string' ? c.replace(/^news ?/, '').substr(0, 100) : 'news'
					if( topic ){
						answer.response = await this.fetch_news( SOCKETS, toon, topic )
					}else{
						answer.response = '"News about wot now?"  ( use "news [topic]" )'
					}

				}else if( c.match(/^url ./) ){

					let url = c.replace(/^url /, '').trim()
					if( url.length > 1000 ){
						answer.response = 'What a query!  Can you shorten that for me ?'
					}else{
						// const document 
						const content = await this.fetch_url( SOCKETS, toon, url )
						answer.response = 'Here you are: <br>' + '<div class="mud-page">' + content + '</div>'
						// const r = 
						// if( r.success ){
						// 	answer.response = r.title + '<br>' + r.content
						// }else{
						// 	answer.response = 'I couldn\'t understand that'
						// }

					}

				}else if( c.match(/^quest$/i)){

					answer.response = 'We\'ve got this tremendous chest of gold, but nothing to award it for at the moment, sadly.'

				}else if( c.match(/^message /) ){

					const msg = lib.sanitize_chat( c.replace(/^message /, '') )
					if( msg.trim().length < 280 ){
						proprietor._guestbook[ toon_id ].message = msg
						answer.response = 'Got it! I\'ll show it to anyone who looks at the guestbook.'
					}else{
						answer.response = 'I can\'t save a message that long, sorry.   280 characters, it\'s a universal standard.'
					}

				}

				break;

			default: break;

		}

		return answer


	}


	async fetch_news( SOCKETS, toon, topic ){

		const proprietor = this

		const res = await node_fetch('https://www.google.com/search?q=' + topic,{
			headers: {
				'accept-encoding': 'gzip,deflate'
			}
		} )
		
		const text = await res.text()
		// .then( r => {

		SOCKETS[ toon.mud_id ].send(JSON.stringify({
			type: 'chat',
			data: {
				google: true,
				method: 'emote',
				speaker: proprietor.name,
				color: proprietor.color,
				// results: [{
				// 	text: 'Actually I haven\'t heard a blasted thing recently.',
				// 	link: '#' 
				// }]
				results: mud_parser( 'search', text )
			}
		}))

		return ' '

	}


	async fetch_url( SOCKETS, toon, url ){

		const proprietor = this

		if( !url.match(/^https?:\/\//i)){
			url = 'http://' + url
		}
		if( !url.match(/\..*/i)){
			return 'I don\'t understand how to look that up'
		}

		// const response = await mud_read( url )

		// return response

		const response = await node_fetch( url, {
			headers: {
				'accept-encoding': 'gzip,deflate'
			}
		})

		const text = await response.text()

		return mud_parser( 'url', text, url )

		// SOCKETS[ toon.mud_id ].send( JSON.stringify({
		// 	type: 'chat',
		// 	data: {
		// 		url: true,
		// 		method: 'emote',
		// 		speaker: proprietor.name,
		// 		color: proprietor.color,
		// 		results: mud_parser( 'url', text )
		// 	}
		// }))

		// return 'Not yet available, sorry'
		// 'Let me look that up for you'

		// .then( res => {
		// 	res.text()
		// 	.then( r => {
		// 		SOCKETS[ toon.mud_id ].send(JSON.stringify({
		// 			type: 'chat',
		// 			data: {
		// 				// google: true,
		// 				method: 'emote',
		// 				speaker: proprietor.name,
		// 				color: proprietor.color,
		// 				// results: [{
		// 				// 	text: 'Actually I haven\'t heard a blasted thing recently.',
		// 				// 	link: '#' 
		// 				// }]
		// 				results: mud_parser( 'url', r )
		// 			}
		// 		}))
		// 	})
		// 	.catch( err => log('flag', err ) )
		// })
		// .catch( err => log('flag', err ) )

	}



	recount_guestbook( toon ){

		if( !Object.keys( this._guestbook ).length ){

			return 'There hasn\'t been anyone by in quite some time, until now.'

		}else if( Object.keys( this._guestbook ).length === 1 ){

			let guest, response
			for( const key of Object.keys( this._guestbook )){
				guest = this._guestbook[ key ]
			}
			if( guest._id === toon._id ){
				if( Math.random() > .5 ){
					response = 'Only one visitor, just you I\'m afraid.'
				}else{
					response = 'Just you and a few tumbleweeds blowing through, friend.'
				}
				let current_msg = ''
			}else{
				response = 'Just one traveler ' + ( guest.moniker ? 'going by ' + guest.moniker : '' ) 
			}

			if( guest.message ) response += '  The guestbook message is: ' + guest.message 

			return response


		}else{

			let visitors = ''

			for( const toon_id of Object.keys( this._guestbook ) ){
				if( Date.now() - Math.abs( this._guestbook[ toon_id ].last_seen ) > GLOBAL.GUESTBOOK_TIME ){
					delete this._guestbook[ toon_id ]
				}else{
					visitors += this._guestbook[ toon_id ].moniker 
				}
				
				if( this._guestbook[ toon_id ].message )  visitors += ' - message: ' + this._guestbook[ toon_id ].message
				
				visitors += '<br>'

			}

			return 'We\'ve had about ' + Object.keys( this._guestbook ).length + ' visitors in the past couple days. They called themselves:<br>' + visitors + ''

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
			_structure_key: structure._id,
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
