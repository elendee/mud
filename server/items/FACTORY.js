const log = require('../log.js')

const Melee = require('./Melee.js')
const Ranged = require('./Ranged.js')
const Magic = require('./Magic.js')
const Armor = require('./Armor.js')
const Resource = require('./Resource.js')

const map = new Map([
	['melee', Melee],
	['ranged', Ranged],
	['magic', Magic],
	['armor', Armor],
	['resource', Resource]
])

module.exports = function( item ) {

	if( item && map.get( item.subtype ) ){

		const itemClass = map.get( item.subtype )

		if( itemClass ){

			const new_item = new itemClass( item )
		
			return new_item 

		}

	}

	return false

}





