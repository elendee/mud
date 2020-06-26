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




class Proprietor{

	constructor( init ){
		init = init || {}
		this.type = proprietor_map[ init.type ]
		this.name = init.proprietor_name || lib.capitalize( this.type ) + '_' + lib.random_hex(4)
		this.zone_name = init.zone_name
		this.color = lib.random_rgb([0,255], [0,255], [0,255])
		// lib.random_rgb(250, 250, 250)
	}

	respond( SOCKETS, toon_id, packet ){

		const proprietor = this

		let method = packet.method
		const c = packet.chat
		let response, timeout

		if( c.match(/xyzzy/i)){
			method = 'emote'
			response = proprietor.name + ' arches an eyebrow quizzically at you.'
			timeout = 1000
		}else if( lib.chat.is_greeting( c ) ){
			response = 'Good day, ' + SOCKETS[ toon_id ].request.session.USER._TOON.name + '.'
			// response = 'Well hello.'
		}else if( c.match(/^asdf$/i)){
			response = 'I\'m sorry to bore you, it\'s been a long day.'
		}else if( c.match(/where am i/i)){
			if( proprietor.zone_name ){
				response = 'You\'re in ' + proprietor.zone_name + '.'
			}else{
				response = 'Out here, it is what you want it to be.  You\'re outland, friend.'
			}
		}else if( c.match(/have you seen/i)){
			response = 'Mmm... no, no I haven\'t.'

		}else if( c.match(/i sell/i)){

			response = 'We don\'t have any coin on hand for buying now, sorry.'

		}else if( c.match(/i want to buy/i) || c.match(/can i buy/i) || c.match(/what'?s for sale/i) || c.match(/what have you got/i) ){

			response = 'Sorry, the pandemic has run us out of supplies currently.  Check back soon.'

		// }else if( packet.match(//i)){
		// }else if( packet.match(//i)){
		// }else if( packet.match(//i)){
		// }else if( packet.match(//i)){
		// }else if( packet.match(//i)){

		}else{
			method = 'emote'
			response = 'The ' + proprietor.type + ' furrows their brow, slightly confused.'
		}

		if( c.match(/^asdf$/i) ){
			setTimeout(function(){
				SOCKETS[ toon_id ].send(JSON.stringify({
					type: 'chat',
					data: {
						sender_type: 'proprietor',
						method: 'emote',
						speaker: proprietor.name,
						// sender_mud_id: 
						chat: 'The ' + proprietor.type + ' hears you drumming you fingers...',
						color: proprietor.color
					}
				}))
			}, timeout - 100 )
		}

		setTimeout(function(){
			SOCKETS[ toon_id ].send(JSON.stringify({
				type: 'chat',
				data: {
					sender_type: 'proprietor',
					method: method,
					speaker: proprietor.name,
					// sender_mud_id: 
					chat: response,
					color: proprietor.color
				}
			}))
		}, timeout || Math.random() * 2000 )
	}
}




function fill_proprietor( structure ){

	if( has_proprietors.includes(structure.subtype) ){
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