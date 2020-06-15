


class Dev {

	constructor( init ){

		init = init || {}

		this.ele = document.getElementById('dev')
		this.crowd = this.ele.querySelector('.crowd')
		this.coords = this.ele.querySelector('.coords')
		this.modulo = this.ele.querySelector('.anim-modulo')
		this.zones = this.ele.querySelector('.zones')
		this.toons = this.ele.querySelector('.toons')
		this.movers = this.ele.querySelector('.movers')

		this.anim_count = 0
	}

	render( type, data ){

		if( type == 'coords' ){

			this.coords.innerHTML = 'x: ' + data.packet.x + '<br>z: ' + data.packet.z

		}else if( type == 'modulo' ){

			this.anim_count++
			this.modulo.style.left = Math.floor( this.anim_count % 100 ) + '%'

		}else if( type == 'pong' ){

			this.zones.innerHTML = 'zones:<br>'
			for( const mud_id of data.zones ){
				this.zones.innerHTML += mud_id + '<br>'
			}

			this.toons.innerHTML = 'toons:<br>'
			for( const mud_id of data.toons ){
				this.toons.innerHTML += mud_id + '<br>'
			}			

		}else if( type == 'movers' ){

			this.movers.innerHTML = 'movers: <br>'
			for( const mover of data ){
				this.movers.innerHTML += mover + '<br>'
			}

		}

	}



}

let dev = false

export default (function(){

	if( dev ) return dev

	dev = new Dev()

	return dev

})()