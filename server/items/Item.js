
const lib = require('../lib.js')

const Persistent = require('../Persistent.js')

const range_map = {
	melee: 15,
	ranged: 75,
	magic: 50,
	armor: 15
}


module.exports = class Item extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		// this._table = 'items'

		this.name = lib.validate_string( init.name, 'unknown' )

		this.icon_url = lib.validate_string( init.icon_url, 'noun_question.png')

		this.cooldown = lib.validate_number( init.cooldown, 2000 )

		this.power = lib.validate_number( init.power, 0 )
		this.armor = lib.validate_number( init.armor, 0 )
		this.range = lib.validate_number( init.range, range_map[ this.type ], 0 )

	}

	async save(){

		const update_fields = [
			'name',
			'icon_url',
			'power',
			'armor',
			'reach'
		]

		const update_vals = [ 
			this.name, 
			this.icon_url,
			this.power,
			this.armor,
			this.range
		]

		// if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
		// 	log('flag', 'cannot identify user for save: ', this._x, this._z, this._layer )
		// 	return false
		// }

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}
