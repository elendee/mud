
class User {
	
	constructor( init ){

		init = init || {}

		for( const key of Object.keys( init )){
			this[ key ] = init[ key ]
		}

	}

}

export default User