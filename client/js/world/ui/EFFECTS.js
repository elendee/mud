import hal from '../../hal.js'
import * as lib from '../../lib.js'

import TARGET from './TARGET.js'

import GLOBAL from '../../GLOBAL.js'
import RENDERER from '../../three/RENDERER.js'

import {
	PlaneBufferGeometry,
	MeshLambertMaterial,
	Mesh,
	Vector3,
	Object3D,
	DoubleSide,
	Group,
	Euler
	// Color,
	// ShaderMaterial
} from '../../lib/three.module.js'

import SCENE from '../../three/SCENE.js'

import texLoader from '../../three/texLoader.js'



const flash_init_scale = 2 // approx image native render
const flash_step = 50
const textures = {
	flash: texLoader.load('/resource/textures/circle.png'),
	slice: texLoader.load('/resource/textures/slice.png'),
	hand_flame: texLoader.load('/resource/textures/hand_flame.png'),
	hand_swing: texLoader.load('/resource/textures/hand_swing.png'),
	magic_basic: texLoader.load('/resource/textures/magic_basic.png'),
	ranged_basic: texLoader.load('/resource/textures/ranged_basic.png'),
}
const flash_geo = new PlaneBufferGeometry(1, 1, 1)
// flash_geo.rotation.x = -Math.PI / 2
// flash_geo.applyMatrix4()

const flash_mat = new MeshLambertMaterial({
	color: 0xffffff,
	map: textures.flash,
	transparent: true,
	opacity: 1,
	side: DoubleSide
})

// const base_rotation = new Object3D()
// base_rotation.rotation.x = -Math.PI / 2

// flash_geo.applyMatrix4( base_rotation.matrix )



class Flash {

	constructor( init ){

		init = init || {}

		if( !init.target ){
			console.log('stopping')
			return false
		}

		this.target = init.target
		
		this.style = init.style || 'fadeout'

		this.duration = init.duration || 200
		this.rise = init.rise || .1
		this.expand = init.expand || .05

		this.r = this.g = this.b = 255

		//// base type color

		if( this.target.type === 'flora' ){
			this.r = 20; this.g = 40; this.b = 20
		}else if( this.target.type === 'structure' ){
			this.r = 30; this.g = 30; this.b = 20
		}else{
			//
		}

		//// base event color
		
		if( init.type === 'death' ){
			this.duration = 10000
			this.expand = .1
			this.rise = .01
		}else if( init.type === 'cast' ){
			this.r = 150; this.g = 20; this.b = 150
		}else if( init.type === 'invoke' ){
			//
		}else if( init.type === 'receive_melee' ){
			this.r += 100; this.g += 100; this.b += 100
		}else if( init.type === 'send_melee' ){
			this.r += 100; this.g += 100; this.b += 100
		}



		this.color = 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')'

		this.ticks = init.ticks || Math.floor( this.duration / flash_step )
		this.fade = init.fade || ( 1 / this.ticks )

		this.geometry = flash_geo.clone()
		this.material = flash_mat.clone()
		init.color ? this.material.color.set( init.color ) : true

		// window.flash
		this.mesh  = new Mesh( this.geometry, this.material )
		// flash.position.copy( target.MODEL.position )
		this.mesh.position.y += 1
		this.mesh.rotation.x = -Math.PI / 2

		this.scale = lib.scale_to_match( this.mesh, this.target.MODEL )

		if( this.target.subtype === 'pine' ){
			this.mesh.scale.x = this.scale.x * .8
			this.mesh.scale.y = this.scale.z * .8
			// this.mesh.scale.z = this.scale.z * .8
		}else{
			this.mesh.scale.x = this.scale.x * 1.1
			this.mesh.scale.y = this.scale.z * 1.1
			// this.mesh.scale.z = this.scale.z * 1.1
		}

		this.started = false

	}


	step(){

		const flash = this

		if( flash.style === 'fadeout' ){

			if( flash.ticks > 0 ){

				flash.mesh.position.copy( flash.target.MODEL.position )

				if( !flash.started ) SCENE.add( flash.mesh )

				RENDERER.frame( SCENE )

				setTimeout(function(){
				
					RENDERER.frame( SCENE )

					if( flash.fade > 0 )  flash.mesh.material.opacity -= flash.fade

					if( flash.rise )  flash.mesh.position.y += flash.rise

					if( flash.expand )  flash.mesh.scale.x += flash.expand; flash.mesh.scale.y += flash.expand

					flash.step()

				}, flash_step )

				flash.ticks--

			}else{
				SCENE.remove( flash.mesh )
				RENDERER.frame( SCENE )
			}

		}else{
			console.log('unhandled flash type: ', flash.type )
		}

	}

}


window.Flash = Flash





class Attack {

	constructor( init ){

		init = init || {}

		this.source = init.source

		if( !this.source || !this.source.BODY || !this.source.MODEL ){
			console.log('invalid attack source', this.source )
			return false
		}

		this.geometry = flash_geo.clone()
		this.material = flash_mat.clone()
		console.log( init.item, lib.map_weapon_texture( init.item ) )
		// debugger
		this.material.map = textures[ lib.map_weapon_texture( init.item ) || 'hand_swing' ]
		init.color ? this.material.color.set( init.color ) : true
		// new MeshLambertMaterial({
		// 	color: this.color || 0xffffff,
		// 	map: textures.slice,
		// 	transparent: true,
		// 	depthWrite: false,
		// 	opacity: 1
		// })
		this.mesh = new Mesh( this.geometry, this.material )

		if( init.slot === 2 ){
			this.mesh.rotation.y = Math.PI
		}

		// this.mesh.position.copy( GLOBAL.ORIGIN )
		this.mesh.rotation.x = -Math.PI / 2

		// console.log( 'pre: ', this.mesh.rotation.x )
		// console.log( 'post: ', this.mesh.rotation.x )

		// this.scale = lib.scale_to_match( this.mesh, ( this.source.BODY || this.source.MODEL ) )
		this.scale = {
			x: 2
		}
		this.mesh.scale.x = this.scale.x * 5
		this.mesh.scale.y = this.scale.x * 5 // (!)
		// this.mesh.scale.y = this.scale.z * 5 // (!)

		this.bbox = new Group()
		this.bbox.position.z += 3 // revisit
		this.bbox.position.y = 10

		this.bbox.add( this.mesh )

	}

	swing(){

		const attack = this
		const toon_bod = TOON.BODY.clone()

		toon_bod.translateZ( 5 )
		attack.bbox.position.copy( TOON.MODEL.position ).add( toon_bod.position )
		attack.bbox.position.y += 5

		// attack.mesh.quaternion.y = toon_bod.quaternion.y
		// let rotY = Math.max( -3.14, toon_bod.rotation.y )
		// console.log( toon_bod.rotation.y )
		// attack.mesh.updateMatrix()
		// attack.mesh.updateMatrixWorld()

		// @ScieCode genius man
		let tmp = new Euler();
		//....
		tmp.setFromQuaternion( toon_bod.quaternion, 'YXZ' );
		attack.bbox.rotation.y = tmp.y;

		// console.log( attack.mesh.rotation.y )
		// attack.mesh.rotation // reset 
		// attack.mesh.rotateOnWorldAxis( new Vector3(0, 1, 0), toon_bod.rotation.y )
		// attack.bbox.rotateY( toon_bod.rotation.y + Math.PI / 2 )
		// attack.mesh.rotation.z = 
		// .rotation.z = window.TOON.BODY.rotation.z
		// attack.mesh.position.z += 
		// attack.source.BODY.add( attack.mesh )
		SCENE.add( attack.bbox )
		// attack.mesh.quaternion.copy( TOON.BODY.quaternion )

		RENDERER.frame( SCENE )

		setTimeout(()=>{
			SCENE.remove( attack.bbox )
			// attack.source.BODY.remove( attack.mesh )
			RENDERER.frame( SCENE )
		}, 300 )

	}

}


window.Attack = Attack











function projectile( init ){
	const geometry = new CylinderBufferGeometry( 
		init.x, 
		init.y, 
		init.z, 
		init.radial_seg, 
		init.height_seg, 
		init.open_ended 
	)

}









export {
	projectile,
	Flash,
	Attack
}

