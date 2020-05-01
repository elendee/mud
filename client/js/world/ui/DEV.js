

class Dev {

	constructor( init ){

		init = init || {}

		this.ele = document.getElementById('dev')
		this.crowd = this.ele.querySelector('.crowd')
		this.coords = this.ele.querySelector('.coords')
		this.modulo = this.ele.querySelector('.anim-modulo')
		this.zones = this.ele.querySelector('.zones')

		this.anim_count = 0
	}

	render( type, data ){

		// if( type == 'crowd' ){

		// 	let toons = 'crowd:<br>'

		// 	for( const mud_id of Object.keys( data )){
		// 		toons += data[ mud_id ].name + '<br>'
		// 	}

		// 	this.crowd.innerHTML = toons

		// }else 
		if( type == 'coords' ){

			this.coords.innerHTML = 'x: ' + data.x + '<br>z: ' + data.z

		}else if( type == 'modulo' ){

			this.anim_count++
			this.modulo.style.left = Math.floor( this.anim_count % 100 ) + '%'

		}else if( type == 'pong' ){

			this.zones.innerHTML = ''
			for( const mud_id of data.zones ){
				this.zones.innerHTML += mud_id + '<br>'
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