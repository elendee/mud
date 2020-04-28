

class World {

	constructor( init ){

		init = init || {}

	}


	render(){

		console.log('avast ye foul beasts')		

	}

}





let world = false

export default (function(){
	if( world ) return world
	world = new World()
	return world
})();