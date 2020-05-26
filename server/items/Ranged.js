
const lib = require('../lib.js')
const log = require('../log.js')

const Item = require('./Item.js')

module.exports = class Ranged extends Item {

	constructor( init ){

		super( init )

		init = init || {}

		this.range = lib.validate_number( init.range, 75 )
		// this.type_meth = 'ranged'

	}

	attack(){
		log('flag', 'ranged attack')
	}

}
