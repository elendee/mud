
const lib = require('../lib.js')
const log = require('../log.js')

const Item = require('./Item.js')

module.exports = class Magic extends Item {

	constructor( init ){

		super( init )

		init = init || {}

		this.subtype = 'magic'

		this.range = lib.validate_number( init.range, 50 )

	}

	attack(){
		log('flag', 'magic attack')
	}

}
