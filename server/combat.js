const env = require('./.env.js')
const log = require('./log.js')
const lib = require('./lib.js')
const interf = require('./interfaces.js')


class Resolver {

	constructor( init ){
		init = init || {}
	}

	resolve( data ){
		switch (data.type) {
			case 'attack':
				if( data.item.range < data.dist ){
					return {
						type: 'combat',
						success: false,
						attacker: data.attacker.mud_id,
						target: data.target.mud_id,
						target_type: data.target.type
					}
				}else{

					let power = ( data.item.power || 0 ) + ( data.attacker._strength || 0 )
					let defense = ( data.target._dexterity || 0 ) + interf.get_armor( data.target )
					let dmg = Math.max( 0, Math.floor( Math.random() * ( power - defense ) ) )

					if( dmg >= data.target.health.current )  data.target.status = 'dead'

					data.target.health.current = Math.max( 0, data.target.health.current - dmg )

					return {
						type: 'combat',
						success: true,
						status: data.target.status,
						attacker: data.attacker.mud_id, 
						attacker_health: data.attacker.health.current,
						target: data.target.mud_id,
						target_health: data.target.health.current,
						target_type: data.target.type,
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


