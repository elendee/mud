
const lib = require('../lib.js')

const Persistent = require('../Persistent.js')

module.exports = class Item extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'items'

		this.name = lib.validate_string( init.name, 'unknown' )

		this.strength = lib.validate_number( init.strength, 0 )
		this.defense = lib.validate_number( init.defense, 0 )
		this.reach = lib.validate_number( init.reach, 0 )

	}

}
