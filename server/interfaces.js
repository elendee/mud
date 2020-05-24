const log = require('./log.js')
const lib = require('./lib.js')

function get_armor( entity ){

	log('flag', 'skipping armor calculation', lib.identify( 'name', entity ) )

	// let defense = entity._defense || entity.defense || 0
	// let armor = 

	return 0

}

module.exports = {
	get_armor
}