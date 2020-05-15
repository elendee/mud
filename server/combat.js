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

				let fail = ''
				if( data.item.range < data.dist ){

					fail = 'range'

				}else if( data.target.health.current <= 0 ){

					fail = 'target_dead'

				}else{

					// log('flag', 'attacker: ', data.attacker )

					let power = ( data.item.power || 0 ) + ( data.attacker._strength || 0 )
					let defense = ( data.target._dexterity || 0 ) + interf.get_armor( data.target )
					let dmg = Math.max( 0, Math.floor( Math.random() * ( power - defense ) ) )

					log('flag', 'wtf mate: ', data.item.power, data.attacker._strength )

					if( dmg >= data.target.health.current )  data.target._status = 'dead'

					data.target.health.current = Math.max( 0, data.target.health.current - dmg )

					return {
						type: 'combat',
						success: true,
						status: data.target._status,
						attacker: data.attacker.mud_id, 
						attacker_health: data.attacker.health.current,
						attacker_type: data.attacker.type,
						target: data.target.mud_id,
						target_health: data.target.health.current,
						target_type: data.target.type,
						dmg: dmg
					}
				}

				return {
					type: 'combat',
					success: false,
					fail: fail,
					attacker: data.attacker.mud_id,
					attacker_type: data.attacker.type,
					target: data.target.mud_id,
					target_type: data.target.type,
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

