const Pine = require('./Pine.js')
const Oak = require('./Oak.js')
// const Key = require('./Key.js')

const map = new Map([
	['pine', Pine],
	['oak', Oak],
])

module.exports = function( flora ) {

	if( map.get( flora.type ) ){

		const floraClass = map.get( flora.type )

		const new_flora = new floraClass( flora )
	
		return new_item 

	}else{

		return false

	}

}