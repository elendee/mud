import Entity from './Entity.js'

export default class Flora extends Entity {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'flora'

	}

}



