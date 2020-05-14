const env = require('./.env.js')
const log = require('./log.js')
const lib = require('./lib.js')
const interf = require('./interfaces.js')


class Resolver {

	constructor( init ){
		init = init || {}
	}

	resolve( packet ){
		switch (packet.type) {
			case 'attack':
				if( packet.item.range < packet.dist ){
					return {
						msg: 'you are too far away'
					}
				}else{
					let power = ( packet.item.power || 0 ) + ( packet.attacker._strength || 0 )
					let defense = ( packet.target._dexterity || 0 ) + interf.get_armor( packet.target )
					let dmg = Math.max( 0, Math.floor( Math.random() * ( power - defense ) ) )
					packet.target.health = Math.max( 0, packet.target.health - dmg )
					return {
						type: 'attack',
						attacker: packet.attacker.mud_id, 
						attacker_health: packet.attacker.health,
						target: packet.target.mud_id,
						target_health: packet.target.health,
						target_type: packet.target.subtype || packet.target.type,
						dmg: dmg
					}
				}
				break;
			default: 
				log('flag', 'unresolved combat type')
				break;
		}
	}

}



let combat = false

module.exports = (function(){

	if( combat ) return combat

	combat = new Resolver()

	return combat

})()


