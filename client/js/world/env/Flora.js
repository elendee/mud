import Entity from './Entity.js'

let delta, then, now

export default class Flora extends Entity {

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'flora'

		this.tippable = true

		this.logistic = this.logistic || []
		this.logistic.push('tippable')

	}


}



