const lib = require('../lib.js')
const log = require('../log.js')

const AgentPersistent = require('./AgentPersistent.js')


class Flora extends AgentPersistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'flora'

		this._table = 'flora'

	}

}


module.exports = Flora