
const lib = require('../lib.js')
const log = require('../log.js')

const Item = require('./Item.js')

module.exports = class Melee extends Item {

	constructor( init ){

		super( init )

		init = init || {}

	}

	attack(){
		log('flag', 'melee attack')
	}

}
