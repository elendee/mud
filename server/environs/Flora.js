const lib = require('../lib.js')
const log = require('../log.js')

const EnvironPersistent = require('./EnvironPersistent.js')


class Flora extends EnvironPersistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'flora'

		this._table = 'flora' // not in db schema currently...

		this._zone_key = init._zone_key

		this.width = lib.validate_number( init.width, 20 )
		this.height = lib.validate_number( init.height, 20 )
		this.length = lib.validate_number( init.length, 60 )

	}

}


module.exports = Flora