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
const geo = new PlaneBufferGeometry( reticule_size, reticule_size, 1 )
const material = new MeshLambertMaterial({
	color: 0xffff55,
	map: reticule_map,
	// side: DoubleSide,
	transparent: true,
	opacity: .3
})
const reticule = new Mesh( geo, material )
reticule.rotation.x = -Math.PI / 2



class Target {

	constructor( init ){

		init = init || {}

		if( env.EXPOSE ) window.TARGET = this

		this.element = document.getElementById('target')
		this.name_ele = document.querySelector('#target-name')
		this.health_ele = document.querySelector('#target-health .status')
		this.mana_ele = document.querySelector('#target-mana .status')
		this.health_readout = document.querySelector('#target-health .readout')
		this.mana_readout = document.querySelector('#target-mana .readout')
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

			this.element.style.display = 'inline-block'
			this.status_ele.style.display = 'inline-block'

			this.show_status()

			this.render_selected()

		}else if( userData.subtype === 'foliage' ){

			console.log('foliage:', clicked )

		}else{

			console.log('no target: ', clicked )

			this.last_rendered = false

			this.clear()

		}

	}






	show_status(){

		if( this.target ){

			let percent_health  
			if( this.target.health.capacity !== 0 ){
				percent_health = this.target.health.current / this.target.health.capacity
			}
			this.health_ele.style.width = Math.floor( percent_health * 100 ) + '%'
			this.health_readout.innerHTML = this.target.health.current + ' / ' + this.target.health.capacity

			if( this.target.mana ){
				let percent_mana
				if( this.target.mana.capacity !== 0 ){
					percent_mana = this.target.mana.current / this.target.mana.capacity
				}
				this.mana_ele.style.width = Math.floor( percent_mana * 100 ) + '%'
				this.mana_readout.innerHTML = this.target.mana.current + ' / ' + this.target.mana.capacity
				// this.mana_ele.style.display = 'initial'
			}else{
				// this.mana_ele.style.display = 'none'
				this.mana_ele.style.width = '0%' // Math.floor( percent_mana * 100 ) + '%'
				this.mana_readout.innerHTML = '0 / 0'
			}



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
		let target_size = new Box3().setFromObject( this.target.MODEL ).getSize()

		console.log( target_size , '<<<')

		// reticule rotated 90deg, so z === y 
		this.reticule.scale.x =  Math.max( .5, .18 + ( target_size.x / this.target.MODEL.scale.x ) / reticule_size )
		this.reticule.scale.y =  Math.max( .5, .18 + ( target_size.z / this.target.MODEL.scale.z ) / reticule_size )

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