
export default class Clickable {

	constructor( init ){

		init = init || {}

		this.mud_id = init.mud_id

		this.clickable = true

		this.name = init.name 
		this.type = init.type
		this.subtype = init.subtype
		this.resource_type = init.resource_type

	}

}