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


const reticule_size = 10
const reticule_map = texLoader.load('/resource/textures/circle.png')
const geo = new PlaneBufferGeometry( reticule_size, reticule_size, 1)
const material = new MeshLambertMaterial({
	color: 0xffff55,
	map: reticule_map,
	// side: DoubleSide,
	transparent: true,
	opacity: .6
})
const reticule = new Mesh( geo, material )
reticule.rotation.x = -Math.PI / 2



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

		}else if( userData.subtype === 'foliage' ){

			console.log('foliage:', clicked )

		}else{

			console.log('no target: ', clicked )

			this.last_rendered = false

			this.clear()

		}

	}






	show_health(){

		if( this.target ){

			let percent_health  
			if( this.target.health.capacity !== 0 ){
				percent_health = this.target.health.current / this.target.health.capacity
			}
			// let percent_shields
			// if( this.target.shields.capacity !== 0 ){
			// 	percent_shields = this.target.shields.current / this.target.shields.capacity
			// }

			// this.shields_ele.style.width = Math.floor( percent_shields * 100 ) + '%'
			this.health_ele.style.width = Math.floor( percent_health * 100 ) + '%'

			this.health_readout.innerHTML = this.target.health.current + ' / ' + this.target.health.capacity
			// this.shields_readout.innerHTML = this.target.shields.current + ' / ' + this.target.shields.capacity

		}

	}


	render_selected(){

		if( !this.target || !this.target.MODEL ){
			console.log('no target')
			return false
		}

		if( this.last_rendered === this.target.mud_id ){
			console.log('redundant click')
			return false
		}

		let bbox_size_vector = new Vector3()
		new Box3().setFromObject( this.target.MODEL ).getSize( bbox_size_vector )

		// reticule rotated 90deg, so z === y 
		this.reticule.scale.x = Math.ceil( ( bbox_size_vector.x / this.target.MODEL.scale.x ) / reticule_size )
		this.reticule.scale.y = Math.ceil( ( bbox_size_vector.z / this.target.MODEL.scale.z ) / reticule_size )

		const wpos = new Vector3()
		this.target.MODEL.getWorldPosition( wpos )

		this.reticule.position.set( 0, ( wpos.y / this.target.MODEL.scale.y ) + .01, 0 )
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

		delete this.target
	

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