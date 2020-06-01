const log = require('../log.js')

const Melee = require('./Melee.js')
const Ranged = require('./Ranged.js')
const Magic = require('./Magic.js')
const Armor = require('./Armor.js')
const Resource = require('./Resource.js')
const Item = require('./Item.js')

const map = new Map([
	['melee', Melee],
	['ranged', Ranged],
	['magic', Magic],
	['armor', Armor],
	['resource', Resource],
	['item', Item]
])

module.exports = function( item ) {

	if( item ){

		let itemClass

		if( item.subtype ){
			itemClass = map.get( item.subtype )
		}else{
			itemClass = map.get( item.type )
		}

		if( itemClass ){

			const new_item = new itemClass( item )
		
			return new_item 

		}

	}

	return false

}





