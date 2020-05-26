import env from '../env.js'
import * as lib from '../lib.js'

import {
	BoxBufferGeometry,
	MeshLambertMaterial,
	Mesh
} from '../lib/three.module.js'

import STATE from './STATE.js'

import Entity from './env/Entity.js'
import Clickable from './Clickable.js'


// const item_status = {
// 	equipped: 'equipped',
// 	loot: 'loot'
// }


export default class Item {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init ) ){
			this[ key ] = init[ key ]
		}

		this.type = 'item'

		this.ref = init.ref || {}
		this.ref.position = lib.validate_vec3( init.position, this.ref.position )

		// this.status = item_status[ init.status ]

		this.logistic = this.logistic || []

	}

	

	model(  ){

		const geo = new BoxBufferGeometry(5, 5, 5)
		const mat = new MeshLambertMaterial({
			color: 'blue'
		})
		const item_mesh = new Mesh( geo, mat )

		this.MODEL = item_mesh
		this.MODEL.position.set( 
			this.ref.position.x,
			this.ref.position.y,
			this.ref.position.z 
		)

		this.MODEL.userData = new Clickable( this )

	}



	animate_death( scene ){
		console.log('animating dead item.. ?')
		if( this.MODEL )  scene.remove( this.MODEL )

	}

	
}