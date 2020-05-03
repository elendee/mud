import env from '../../env.js'

// import SOUND from '../../../SOUND.js'

// import ZONE from '../ZONE.js'

import STATE from '../STATE.js'
import GLOBAL from '../../GLOBAL.js'

import RENDERER from '../../three/RENDERER.js'
import SCENE from '../../three/SCENE.js'

// import { getView } from '../../View.js'
// import VIEW from '../../VIEW.js'

import texLoader from '../../three/texLoader.js'

import { 
	// LineSegments, 
	// WireframeGeometry, 
	// BoxBufferGeometry,
	PlaneBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	DoubleSide,
	// Sprite,
	// SpriteMaterial,
	Vector3,
	Box3,
} from '../../lib/three.module.js'



const reticule_map = texLoader.load('/resource/textures/reticule_map2.png')
const geo = new PlaneBufferGeometry(10, 10, 1)
const material = new MeshLambertMaterial({
	// color: 0xffff55,
	map: reticule_map,
	side: DoubleSide,
	transparent: true
})
const reticule = new Mesh( geo, material )
reticule.rotation.x = Math.PI / 2



// const spriteMap = new TextureLoader().load( '/resource/textures/reticule.png' )
// const spriteMaterial = new SpriteMaterial( { map: spriteMap, color: 0xffffff } )
// const reticule = new Sprite( spriteMaterial )
// reticule.scale.set( 100, 100, 1 )
// reticule.center.set( .5, .5 )
// reticule.position.set( 0, 0, 0 ) 
// reticule.rotation



class Target {

	constructor( init ){

		init = init || {}

		if( env.EXPOSE ) window.TARGET = this

		this.element = document.getElementById('target')
		this.name_ele = document.querySelector('#target-name')
		this.health_ele = document.querySelector('#target-health .status')
		this.shields_ele = document.querySelector('#target-shields .status')
		this.health_readout = document.querySelector('#target-health .readout')
		this.shields_readout = document.querySelector('#target-shields .readout')
		this.status_ele = document.querySelector('#status')
		this.profile_img = document.getElementById('target-profile')
		// this.helper = document.getElementById('target-helper')

		// this.parent = init.parent

		this.reticule = reticule

		this.target = init.target

		this.last_rendered = false
		// this.FLORA = init.FLORA
		// this.STRUCTURES = init.STRUCTURES
		// this.NPCS = init.NPCS
		// this.TOONS = init.TOONS

	}



	set( clicked, ZONE ){


		if( STATE.handler !== 'world' ){
			console.log( 'should not be running target in state.handler: ', STATE.handler )
			return false
		}

		const userData = clicked.userData

		if( userData && userData.mud_id ){

			if( this.target && clicked.userData.mud_id !== this.target.mud_id )  this.clear()

			if( userData.type === 'flora' && ZONE.FLORA[ userData.mud_id ] ) {

				this.target = ZONE.FLORA[ userData.mud_id ]

			}else if( userData.type === 'self' ){

				this.target = window.TOON

			}else if( userData.type === 'npc' && ZONE.NPCS[ userData.mud_id ]){

				this.target = ZONE.NPCS[ userData.mud_id ]

			}

			this.profile_img.src = '/resource/images/profiles/' + GLOBAL.PROFILE_IMGS[ userData.type ] || 'unknown.png'

			this.name_ele.innerHTML = userData.name || userData.type || 'unknown'

			this.render_selected()

			this.element.style.display = 'inline-block'
			this.status_ele.style.display = 'inline-block'

			this.show_health()

		}else{

			console.log('no target')

			this.last_rendered = false

			this.clear()

		}

	}






	show_health(){

		if( this.entropic ){

			let percent_health  
			if( this.entropic.health.capacity !== 0 ){
				percent_health = this.entropic.health.current / this.entropic.health.capacity
			}
			let percent_shields
			if( this.entropic.shields.capacity !== 0 ){
				percent_shields = this.entropic.shields.current / this.entropic.shields.capacity
			}

			this.shields_ele.style.width = Math.floor( percent_shields * 100 ) + '%'
			this.health_ele.style.width = Math.floor( percent_health * 100 ) + '%'

			this.health_readout.innerHTML = this.entropic.health.current + ' / ' + this.entropic.health.capacity
			this.shields_readout.innerHTML = this.entropic.shields.current + ' / ' + this.entropic.shields.capacity

		}

	}


	render_selected(){

		if( !this.target || !this.target.MODEL ){
			console.log('no target')
			return false
		}

		if( this.last_rendered === this.target.mud_id ){
			console.log('reduncdant click')
			return false
		}

		// object.children[0].

		// for( const child of this.target.MODEL.children ){
		// 	child.material.opacity = .3
		// 	child.material.transparent = true
		// }

		// this.parent = this.target

		// console.log( this.target )

		// this.parent.is_target = true

		let bbox_size_vector = new Vector3()
		new Box3().setFromObject( this.target.MODEL ).getSize( bbox_size_vector )
		// let max = Math.max( bbox_size_vector.x, bbox_size_vector.y ) * 1.5
		// max = Math.min( max, 400 )
		// max = Math.max( max, 15 )
		this.reticule.scale.set( Math.max( .5, bbox_size_vector.x / 8 ) , Math.max( .5, bbox_size_vector.z / 8 ), 1 )

		console.log( this.reticule.scale )
		// this.reticule.scale.set( 1, 1, 1 )

		// console.log(' bbox: ', bbox_size_vector )

		this.reticule.position.set( 0, this.target.MODEL.position.y + .3, 0 )
			// this.target.MODEL.position.x,
			// this.target.MODEL.position.y + 5,
			// this.target.MODEL.position.z
		 // )
		this.target.MODEL.add( this.reticule )


		// SOUND.play( SOUND.ui.blip[0] )

		this.last_rendered = this.target.mud_id

		RENDERER.frame( SCENE )



	}



	clear( clear ){

		this.element.style.display = 'none'
		this.status_ele.style.display = 'none'
		this.profile_url = ''

		if( !this.target || !this.target.MODEL ) return false

		// for( const child of this.target.MODEL.children ){
		// 	child.material.opacity = 1
		// 	child.material.transparent = false
		// }


		// this.helper.innerHTML = ''
		// this.helper.style.display = 'none'
		if( clear ) this.last_rendered = false

		this.target.MODEL.remove( this.reticule )

		RENDERER.frame( SCENE )

		// delete this.parent.is_target

		// this.reticule.scale.set( 1, 1, 1 )
		
		// delete this.parent
		// delete this.entropic
		// delete this.sentient

		// delete this.model ?

	}

}




let target = false

export default (function(){

	if( target ) return target

	target = new Target()

	return target

})();