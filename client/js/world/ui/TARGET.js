import env from '../../env.js'
import * as lib from '../../lib.js'

// import SOUND from '../../../SOUND.js'

// import ZONE from '../ZONE.js'

import STATE from '../STATE.js'
import GLOBAL from '../../GLOBAL.js'

import RENDERER from '../../three/RENDERER.js'
import SCENE from '../../three/SCENE.js'

import * as MOUSE from './MOUSE.js'

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
		this.status_ele = document.querySelector('#status')
		this.name_ele = document.querySelector('#target-name')
		this.health_ele = document.querySelector('#target-health .status')
		this.mana_ele = document.querySelector('#target-mana .status')
		this.item_ele = document.querySelector('#target-item')
		this.structure_ele = document.querySelector('#structure-key')
		this.health_readout = document.querySelector('#target-health .readout')
		this.mana_readout = document.querySelector('#target-mana .readout')
		this.profile_img = document.getElementById('target-profile')

		this.reticule = reticule

		this.target = init.target

		this.last_rendered = false
		this.item_ele.addEventListener('click', ( e ) => {
			MOUSE.mousehold.pickup( this.item_ele.getAttribute('data-id'), 'zone' )
		})

		this.structure_ele.addEventListener('click', ( e )=>{
			if( !this.structure_ele.src.match(/hourglass/)){
				TOON.attempt_entry( this.target.mud_id )
				this.structure_ele.src = '/resource/images/icons/hourglass.png'
			}
		})

	}



	set( ZONE, clicked ){

		if( STATE.handler !== 'world' ){
			console.log( 'should not be running target in state.handler: ', STATE.handler )
			return false
		}

		const userData = clicked.userData

		// console.log( userData )

		if( userData && userData.mud_id ){

			if( this.target && clicked.userData.mud_id !== this.target.mud_id )  this.clear()

			if( userData.type === 'flora' && ZONE.FLORA[ userData.mud_id ] ) {

				this.target = ZONE.FLORA[ userData.mud_id ]

			}else if( userData.type === 'toon' ){

				if( userData.self ){

					this.target = window.TOON

				}else if( ZONE.NPCS[ userData.mud_id ] ){

					this.target = ZONE.NPCS[ userData.mud_id ]

				}else if( ZONE.TOONS[ userData.mud_id ] ){

					this.target = ZONE.TOONS[ userData.mud_id ]

				}

			}else if( userData.type == 'structure' && ZONE.STRUCTURES[ userData.mud_id ]){

				this.target = ZONE.STRUCTURES[ userData.mud_id ]

			}else if( userData.type == 'item' && ZONE.ITEMS[ userData.mud_id ]){

				this.target = ZONE.ITEMS[ userData.mud_id ]

			}

			this.profile_img.src = '/resource/images/icons/' + lib.identify( 'icon', userData ) + '.png'

			this.name_ele.innerHTML = userData.resource_type || lib.identify( 'name', userData )
			if( userData.self ) this.name_ele.innerHTML += ' (you)'
			// userData.name || userData.type || 'unknown'

			this.element.style.display = 'inline-block'
			this.status_ele.style.display = 'inline-block'

			if( this.target ){

				this.show_name()

				if( this.target.type === 'structure' ){
					this.show_structure( userData )
				}

				if( this.target.type === 'item' ){
					this.show_item( userData )
				}else{
					this.show_status()
				}
				
				TOON.look_at( this.target.MODEL.position )

				this.render_selected()

			}

		}else if( userData && userData.subtype === 'foliage' ){

			console.log('foliage:', clicked )

		}else{

			console.log('no target: ', clicked )

			this.last_rendered = false

			this.clear()

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
		target_size.x = target_size.x / this.target.MODEL.scale.x
		target_size.y = target_size.y / this.target.MODEL.scale.y
		target_size.z = target_size.z / this.target.MODEL.scale.z

		if( this.target.type === 'item' ){
			this.reticule.scale.x =  Math.max( 1 )
			this.reticule.scale.y =  Math.max( 1 )
		}else{
			this.reticule.scale.x = Math.max( .5, ( target_size.x / reticule_size ) * 1.2 )
			this.reticule.scale.y = Math.max( .5, ( target_size.z / reticule_size ) * 1.2 )
		}

		const wpos = new Vector3()
		this.target.MODEL.getWorldPosition( wpos )

		this.reticule.position.set( 0, .2, 0 )
		this.reticule.rotation.z = this.target.MODEL.rotation.y

		this.target.MODEL.add( this.reticule )

		this.last_rendered = this.target.mud_id

		RENDERER.frame( SCENE )

	}



	show_name(){

		this.name_ele.style.display = 'initial'

	}



	show_item( userData ){

		this.item_ele.setAttribute('src', '/resource/images/icons/' + lib.identify( 'icon', userData ) + '.png' )

		this.status_ele.style.display = 'none'

		this.item_ele.style.display = 'initial'

		this.item_ele.setAttribute('data-id', this.target.mud_id )

		// console.log( 'renderin from : ', this.target )

	}


	show_structure(){

		this.structure_ele.style.display = 'initial'

	}



	show_status(){

		this.item_ele.style.display = 'none'

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

			this.status_ele.style.display = 'initial'

		}

	}




	clear( clear ){

		this.element.style.display = 'none'
		this.status_ele.style.display = this.name_ele.style.display = this.structure_ele.style.display = this.item_ele.style.display = 'none'
		this.profile_url = ''

		if( !this.target || !this.target.MODEL ) return false

		if( clear ) this.last_rendered = false

		this.target.MODEL.remove( this.reticule )

		delete this.target
	

		RENDERER.frame( SCENE )

	}

}




let target = false

export default (function(){

	if( target ) return target

	target = new Target()

	return target

})();