
import Entity from './Entity.js'

export default class Structure extends Entity{

	constructor( init ){

		super( init )

		init = init || {}

		this.type = 'structure'

	}

}