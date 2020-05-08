
const lib = require('../lib.js')
const log = require('../log.js')

const Item = require('./Item.js')

module.exports = class Armor extends Item {

	constructor( init ){

		super( init )

		init = init || {}

		this.armor = lib.validate_number( init.armor, 1 )

	}

	attack( target ){
		log('flag', 'armor attack')
	}

}
