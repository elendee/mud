import env from '../env.js'

import STATE from './STATE.js'

export default class Item {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

	}
	
}