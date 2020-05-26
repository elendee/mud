const lib = require('../lib.js')
const log = require('../log.js')

const EnvironPersistent = require('./EnvironPersistent.js')


class Structure extends EnvironPersistent {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'structure'

		this._table = 'structures'

		// this.zone_key = init.zone_key

		// this.type = init.type

		// // this._x = lib.validate_number( init.x, init._x, 0 )
		// // this._y = lib.validate_number( init.x, init._y, 0 )
		// // this._z = lib.validate_number( init.x, init._z, 0 )



		this.width = lib.validate_number( init.width, 40 )
		this.height = lib.validate_number( init.height, 40 )
		this.length = lib.validate_number( init.length, 40 )

		this.orientation = lib.validate_number( init.orientation, 0 )

	}



	async save(){

		const update_fields = [
			'name',
			'zone_key',
			'icon_url',
			'model_url',
			'subtype',
			'x',
			'y',
			'z',
			'width',
			'height',
			'length',
			'orientation'
		]

		const update_vals = [ 
			this.name, 
			this._zone_key,
			this.icon_url,
			this.model_url,
			this.subtype,
			this.ref.position.x,
			this.ref.position.y,
			this.ref.position.z,
			this.width,
			this.height,
			this.length,
			this.orientation
		]

		// if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
		// 	log('flag', 'cannot identify user for save: ', this._x, this._z, this._layer )
		// 	return false
		// }

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}


module.exports = Structure