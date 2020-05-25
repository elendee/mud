import env from '../env.js'

import STATE from './STATE.js'

export default class Item {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

	}

	animate_death( scene ){
		console.log('animating dead item.. ?')
		if( this.MODEL )  scene.remove( this.MODEL )

	}

	
}