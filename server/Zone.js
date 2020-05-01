const DB = require('./db.js')
const log = require('./log.js')

const GLOBAL = require('./GLOBAL.js')

const SOCKETS = require('./SOCKETS.js')

const Persistent = require('./Persistent.js')
const Toon = require('./Toon.js')
const Structure = require('./Structure.js')
const Foliage = require('./Foliage.js')


class Zone extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'zones'

		this.name = init.name

		this._x = typeof( init._x ) === 'number' ? init._x : init.x
		this._z = typeof( init._z ) === 'number' ? init._z : init.z
		this._layer = typeof( init._layer ) === 'number' ? init._layer :  init.layer

		this.precipitation = typeof( init.precipitation ) === 'number' ? init.precipitation : 1

		this._pulses = {
			move: false
		}

		this._FOLIAGE = init.FOLIAGE || {}
		this._STRUCTURES = init.STRUCTURES || {}
		this._NPCS = init.NPCS || {}
		this._TOONS = init.TOONS || {}

	}

	get_id(){

		if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
			log('flag', 'could not build zone id: ', this._x, this._z, this._layer )
			return false
		}

		return this._x + '-' + this._z + '-' + this._layer

	}

	async bring_online(){

		const zone = this

		this._pulses.move = setInterval(function(){

			let packet = {}

			for( const mud_id of Object.keys( zone._TOONS )){
				packet[ mud_id ] = {
					position: zone._TOONS[ mud_id ].ref.position,
					quaternion: zone._TOONS[ mud_id ].ref.quaternion
				}
			}

			for( const mud_id of Object.keys( SOCKETS ) ){
				SOCKETS[ mud_id ].send( JSON.stringify({
					type: 'move_pulse',
					packet: packet
				}))
			}

		}, GLOBAL.PULSES.MOVE )

		return true

	}

	async save(){

		const update_fields = [
			'name',
			'x',
			'z',
			'layer',
			'precipitation'
		]

		const update_vals = [ 
			this.name, 
			this._x,
			this._z,
			this._layer,
			this.precipitation
		]

		if( typeof( this._x ) !== 'number' || typeof( this._z ) !== 'number' || typeof( this._layer ) !== 'number' ){
			log('flag', 'cannot identify zone for save: ', this._x, this._z, this._layer )
			return false
		}

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

	close(){

		log('flag', 'closing zone: ', this.mud_id )

	}

}



module.exports = Zone