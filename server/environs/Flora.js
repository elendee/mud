const lib = require('../lib.js')
const log = require('../log.js')

const EnvironPersistent = require('./EnvironPersistent.js')


		// const rand_radial = 10 + Math.floor( Math.random() * 20 )
		// const rand_vertical = 20 + Math.floor( Math.random() * 30 )

const seed_map = {
	pine: {
		width: 20,
		height: 40
	},
	oak: {
		width: 40,
		height: 60
	}
}


class Flora extends EnvironPersistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'flora'

		this._table = 'flora' // not in db schema currently...

		this.width = lib.validate_number( init.width, Math.floor( seed_map[ this.subtype ].width + Math.random() * seed_map[ this.subtype ].width ) )
		this.length = lib.validate_number( init.length, this.width )
		this.height = lib.validate_number( init.height, Math.floor( seed_map[ this.subtype ].height + Math.random() * seed_map[ this.subtype ].height ) )

	}

}


module.exports = Flora