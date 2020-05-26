
const lib = require('../lib.js')
const log = require('../log.js')

const Item = require('./Item.js')

module.exports = class Melee extends Item {

	constructor( init ){

		super( init )

		init = init || {}

		this.subtype = 'melee'

		this.range = lib.validate_number( init.range, 15 )

	}

	attack(){
		log('flag', 'melee attack')
	}

}
