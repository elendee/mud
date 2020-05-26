const { Vector3 } = require('three')

const lib = require('../lib.js')
const log = require('../log.js')

module.exports = class Loot {

	constructor( init ){

		init = init || {}

		this.type = init.type

		this.ref = init.ref || {}
		this.ref.position = lib.validate_vec3( new Vector3(
			this.ref.position.x + ( -1 + Math.random() * 2 ) * 10,
			1,
			this.ref.position.z + ( -1 + Math.random() * 2 ) * 10,
		))
		this.entity = init.entity
		this.timeout = init.timeout

	}

}
