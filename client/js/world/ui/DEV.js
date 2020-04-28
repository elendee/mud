

class Dev {

	constructor( init ){
		init = init || {}

		this.ele = document.getElementById('dev')
		this.crowd = this.ele.querySelector('.crowd')
		this.coords = this.ele.querySelector('.coords')
		this.ele.style.display = 'none'

	}

	render( type, data ){

		if( localStorage.getItem('devkey') === 'true' ){

			if( type == 'crowd' ){

				let patrons = 'crowd:<br>'

				for( const dpkt_id of Object.keys( data )){
					patrons += data[ dpkt_id ].name + '<br>'
				}

				this.crowd.innerHTML = patrons

			}else if( type == 'coords' ){

				this.coords.innerHTML = 'x: ' + data.x + '<br>z: ' + data.z

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