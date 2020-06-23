
const lib = require('../lib.js')

const Persistent = require('../Persistent.js')

const DB = require('../db.js')



module.exports = class Item extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._owner_key = lib.validate_number( init._owner_key, init.owner_key, undefined )
		this._zone_key = lib.validate_number( init._zone_key, init._zone_key, undefined )
		this._npc_key = lib.validate_number( init._npc_key, init._npc_key, undefined )

		this.type = 'item'

		this._table = 'items'

		this.weight = lib.validate_number( init.weight, 0 )

		this.name = lib.validate_string( init.name, undefined )

		this.resource_type = init.resource_type

		this.cooldown = lib.validate_number( init.cooldown, 2000 )

		this.power = lib.validate_number( init.power, 0 )
		this.armor = lib.validate_number( init.armor, 0 )
		this.range = lib.validate_number( init.range, 0 )

		// lib.range_map[ this.type ]
		// this.ref = init.ref || {}
		// this.ref.position = lib.validate_vec3( this.ref.position )
		// this._timeout = init._timeout

	}

	async save(){

		const update_fields = [
			'name',
			'owner_key',
			'zone_key',
			'npc_key',
			'icon_url',
			'power',
			'armor',
			'reach',
			'weight',
			'x',
			'y',
			'z'
		]

		const update_vals = [ 
			this.name, 
			this._owner_key,
			this._zone_key,
			this._npc_key,
			this.icon_url,
			this.power,
			this.armor,
			this.range,
			this.weight,
			this.ref.position.x,
			this.ref.position.y,
			this.ref.position.z,
		]

		// if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
		// 	log('flag', 'cannot identify user for save: ', this._x, this._z, this._layer )
		// 	return false
		// }

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}
