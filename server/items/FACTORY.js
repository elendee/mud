const Melee = require('./Melee.js')
const Ranged = require('./Ranged.js')
const Magic = require('./Magic.js')
// const Key = require('./Key.js')

const map = new Map([
	['melee', Melee],
	['ranged', Ranged],
	['magic', Magic],
])

module.exports = function( item ) {

	if( map.get( item.type ) ){

		const itemClass = map.get( item.type)

		const new_item = new itemClass( item )
	
		return new_item 

	}else{

		return false

	}

}