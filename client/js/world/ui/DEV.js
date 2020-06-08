

class Dev {

	constructor( init ){

		init = init || {}

		this.ele = document.getElementById('dev')
		this.crowd = this.ele.querySelector('.crowd')
		this.coords = this.ele.querySelector('.coords')
		this.modulo = this.ele.querySelector('.anim-modulo')
		this.zones = this.ele.querySelector('.zones')
		this.toons = this.ele.querySelector('.toons')

		this.anim_count = 0
	}

	render( type, data ){

		// const data = obj ? obj.packet : false

		// if( type == 'crowd' ){

		// 	let toons = 'crowd:<br>'

		// 	for( const mud_id of Object.keys( data )){
		// 		toons += data[ mud_id ].name + '<br>'
		// 	}

		// 	this.crowd.innerHTML = toons

		// }else 
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

		}

	}



}

let dev = false

export default (function(){

	if( dev ) return dev

	dev = new Dev()

	return dev

})()