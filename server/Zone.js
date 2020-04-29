
const Persistent = require('./Persistent.js')
const Toon = require('./Toon.js')
const Structure = require('./Structure.js')
const Foliage = require('./Foliage.js')

const DB = require('./db.js')

class Zone extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'zones'

		this.name = init.name

		this._x = init._x
		this._z = init._z
		this._altitude = init._altitude

		this.precipitation = init.precipitation || 1

		this.move_pulse = false
		this.census = false
		this.growth = false
		this.bot_pulse = false

		this.FOLIAGE = init.FOLIAGE
		this.STRUCTURES = init.STRUCTURES
		this.NPCS = init.NPCS
		this.TOONS = init.TOONS

	}

	async bring_online(){



		return true

	}

	async save(){

		const update_fields = [
			'name',
			'x',
			'z',
			'altitude',
			'precipitation'
		]

		const update_vals = [ 
			this.name, 
			this._x,
			this._z,
			this._altitude,
			this.precipitation
		]

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}



module.exports = Zone