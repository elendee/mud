
const lib = require('../lib.js')
const log = require('../log.js')

const Item = require('./Item.js')

module.exports = class Resource extends Item {

	constructor( init ){

		super( init )

		init = init || {}

		this.weight = lib.validate_number( init.weight, 1 )

	}

	attack(){
		log('flag', lib.identify( false, this ) + ' attack')
	}

}
