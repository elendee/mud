const lib = require('../lib.js')
const log = require('../log.js')

const EnvironPersistent = require('./EnvironPersistent.js')



const has_proprietors = ['blacksmith', 'tavern']



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

		this.proprietor_name = init.proprietor_name

		this.orientation = lib.validate_number( init.orientation, 0 )

		this._private = lib.validate_number( init._private, init.private, false )
		this._owners = init._owners || []
		this._residents = []

		this.fill_proprietor( this.proprietor_name )

	}



	fill_proprietor(){

		if( has_proprietors.includes[ this.subtype ] ){
			this.proprietor = new Proprietor({
				type: this.subtype,
				name: this.proprietor_name
			})
		}

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




class Proprietor{

	constructor( init ){
		init = init || {}
		this.name = init.proprietor_name || 'An anonymous figure'
	}

	process_input( input ){

		if( input.match(/^hi$/i) ){

		}else if( input.match(/^hello$/i)){

		}else if( input.match(/adf/)){

		}

	}
}


module.exports = Structure