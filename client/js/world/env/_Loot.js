import * as lib from '../../lib.js'
import Entity from './Entity.js'
import {
	BoxBufferGeometry,
	MeshLambertMaterial,
	Mesh
} from '../../lib/three.module.js'

import Clickable from '../Clickable.js'

// let delta, then, now

export default class Loot {

	constructor( init ){

		init = init || {}

		this.type = 'loot'

		// this.tippable = true

		this.ref = init.ref || {}
		this.ref.position = lib.validate_vec3( init.position, this.ref.position )

		this.entity = init.entity

		this.logistic = this.logistic || []
		// this.logistic.push('tippable')

	}


	model(  ){

		const geo = new BoxBufferGeometry(5, 5, 5)
		const mat = new MeshLambertMaterial({
			color: 'blue'
		})
		const loot_mesh = new Mesh( geo, mat )

		this.MODEL = loot_mesh
		this.MODEL.position.set( 
			this.ref.position.x,
			this.ref.position.y,
			this.ref.position.z 
		)

		this.MODEL.userData = new Clickable( this )

	}

}





			