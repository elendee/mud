
import * as MOUSE from './MOUSE.js'
import * as POPUPS from './POPUPS.js'
import * as lib from '../../lib.js'
import TARGET from './TARGET.js'

export default class Popup {
	
	constructor( options = {} ){

        this.options = options;
        
		if( !options.id ){
			console.log('cannot init popup without id')
			return false
		}

		this.id = options.id

		const ref = this
        
        // this.w = 200;
        // this.h = 124;
        // this.topbarHeight = 16;

		this.mousedown = false
		this.lastX = 0
		this.lastY = 0
		this.curX = lib.validate_number( options.curX, 100 )
		this.curY = lib.validate_number( options.curY, 50 )
		this.diffX = 0
		this.diffY = 0
        
        this.init()

		POPUPS.all.push( this )

		document.body.appendChild( this.element )

	}

    init() {
        this.initElements()
        this.initEvents()
    }
    
    initElements() {

        this.element = document.createElement('div')
		this.element.classList.add('popup')
		this.element.id = this.options.id

		this.topbar = document.createElement('div')
		this.topbar.classList.add('topbar')
		this.element.appendChild( this.topbar )
        
		this.title = document.createElement('div')
		this.title.classList.add('title')
		this.title.innerHTML = this.options.id
		this.topbar.appendChild( this.title )

		this.close = document.createElement('div')
		this.close.classList.add('close')
		this.close.innerHTML = 'X'
		this.topbar.appendChild( this.close )

		this.content = document.createElement('div')
		this.content.classList.add('content')
		this.element.appendChild( this.content )

		this.content_equip = document.createElement('div')
		this.content_equip.classList.add('content-equip')
		this.content.appendChild( this.content_equip )

		this.content_resource = document.createElement('div')
		this.content_resource.classList.add('content-resource')
		this.content.appendChild( this.content_resource )

		if( this.id == 'inventory' ){
			this.overlay = document.createElement('div')
			this.overlay.classList.add('overlay')
			this.element.appendChild( this.overlay )
			this.overlay.addEventListener('click', (e)=>{
				MOUSE.mousehold.drop( 'acquire', TARGET )
			})
			this.element.appendChild( this.overlay )
		}

    }

    initEvents() {

    	const _this = this

        const mousedown = e => {
			this.mousedown = true
			this.startX = e.clientX
			this.startY = e.clientY
			this.lastX = e.clientX
			this.lastY = e.clientY
            const rect = this.element.getBoundingClientRect();
            this.left = rect.left;
            this.top = rect.top;
            this.diffX = this.startX - this.left
            this.diffY = this.startY - this.top

		};
  //       const mousemove = e => {
		// 	if( this.mousedown ){
		// 		this.curX = e.clientX - this.diffX
		// 		this.curY = e.clientY - this.diffY
		// 		this.element.style.top = Math.floor( this.curY ) + 'px'
		// 		this.element.style.left = Math.floor( this.curX ) + 'px'
		// 		this.lastX = e.clientX
		// 		this.lastY = e.clientY
		// 	}	
		// };
        const mouseup = e => {
			this.mousedown = false
		};
        
        this.topbar.addEventListener('mousedown', mousedown)
		// window.addEventListener('mousemove', mousemove)
		window.addEventListener('mouseup', mouseup)
        
        this.topbar.addEventListener('touchstart', mousedown)
		// window.addEventListener('touchmove', mousemove)
		window.addEventListener('touchend', mouseup)
        
        this.close.addEventListener('click', () => {
        	this.unrender()
			this.set_visible( false )
		})


        this.element.addEventListener('mousedown', () =>{
        	POPUPS.bring_to_top( _this )
        })

    }

  //   mousemove( e ){

  //   	console.log( this )

		// if( this.mousedown ){
		// 	this.curX = e.clientX - this.diffX
		// 	this.curY = e.clientY - this.diffY
		// 	this.element.style.top = Math.floor( this.curY ) + 'px'
		// 	this.element.style.left = Math.floor( this.curX ) + 'px'
		// 	this.lastX = e.clientX
		// 	this.lastY = e.clientY
		// }	

  //   }
    
	set_visible( visible ){

		const _this = this

		if( visible ){
		
			this.unrender()
			this.render()

			this.element.style.display = 'inline-block'
			this.element.style.left = this.curX
			this.element.style.top = this.curY

			window.addEventListener('mousemove', move_active_popup )
			window.addEventListener('touchmove', move_active_popup )

			POPUPS.bring_to_top( this )

		}else{

			_this.element.style.display = 'none'

			window.removeEventListener( 'mousemove', move_active_popup )
			window.removeEventListener( 'touchmove', move_active_popup )

			for( let i = POPUPS.active.length -1; i >= 0; i-- ){
				if( POPUPS.active[i].id === _this.id ){
					POPUPS.active.splice( i, 1 )
				}
			}

		}

	}



	render_stats( obj ){

		this.content.innerHTML = ''

		for( const key of Object.keys( window.TOON )){

			if( !window.TOON.logistic.includes( key ) ){

				let this_key = window.TOON[ key ]

				if( typeof this_key === 'object' ) {

					let stat_wrapper = document.createElement('div')
					stat_wrapper.classList.add('stat-wrapper')
					this.content.appendChild( stat_wrapper )
					
					let stat_wrap_title = document.createElement('div')
					stat_wrap_title.classList.add('stat-key')
					stat_wrap_title.innerHTML = '<span class="stat-wrap-title">' + key.replace('_','') + ':</span><br>'
					stat_wrapper.appendChild( stat_wrap_title )
					
					for( const sub_key of Object.keys( window.TOON[ key ] ) ){
						render_stat( sub_key, window.TOON[ key ][ sub_key ], stat_wrapper )
					}

				}else{
					render_stat( key, window.TOON[ key ], this.content )
				}
				

			}

		}

	}


	render_inventory( INVENTORY ){

		// this.content.innerHTML = ''
		this.content_equip.innerHTML = this.content_resource.innerHTML = ''

		for( const mud_id of Object.keys( INVENTORY )){
			if( INVENTORY[ mud_id ].subtype !== 'resource' )  this.render_item( 'equip', mud_id, INVENTORY )
		}

		for( const mud_id of Object.keys( INVENTORY )){
			if( INVENTORY[ mud_id ].subtype === 'resource' )  this.render_item( 'resource', mud_id, INVENTORY )
		}

	}

	render_item( category, mud_id, INVENTORY ){

		let item = INVENTORY[ mud_id ]

		let row = document.createElement('div')
		row.classList.add('stat', item.subtype )
		let icon = document.createElement('img')
		icon.classList.add('icon')
		icon.src = '/resource/images/icons/' + lib.identify( 'icon', INVENTORY[ mud_id ] ) + '.png' // INVENTORY[ mud_id ].icon_url
		icon.addEventListener('click', function(){
			MOUSE.mousehold.pickup( mud_id, 'inventory' )
		})
		row.appendChild( icon )
		let stat_key = document.createElement('span')
		stat_key.classList.add('stat-key')
		stat_key.innerHTML = lib.identify( 'name', item )
		row.appendChild( stat_key )
		
		row.appendChild( document.createElement('br'))
		
		this['content_' + category].appendChild( row )

	}

	unrender(){
		this.content_equip.innerHTML = this.content_resource.innerHTML = ''
		// this.content.innerHTML = ''
	}

	render(){
		console.log('this popup only has the default render')
	}

}


let moving_popup

const move_active_popup = e => {

	let moving_popup = POPUPS.active[POPUPS.active.length-1]
	
	if( moving_popup.mousedown ){
		moving_popup.curX = e.clientX - moving_popup.diffX
		moving_popup.curY = e.clientY - moving_popup.diffY
		moving_popup.element.style.top = Math.floor( moving_popup.curY ) + 'px'
		moving_popup.element.style.left = Math.floor( moving_popup.curX ) + 'px'
		moving_popup.lastX = e.clientX
		moving_popup.lastY = e.clientY
	}

}



function render_stat( key, value, destination ){

	let stat = document.createElement('div')
	stat.classList.add('stat')

	let stat_key = document.createElement('span')
	stat_key.classList.add('stat-key')
	stat_key.innerHTML = key
	stat.appendChild( stat_key )

	let stat_val = document.createElement('span')
	stat_val.classList.add('stat-val')
	if( key === 'color' ){
		stat_val.innerHTML = '<div class="stat-color" style="background: linear-gradient(' + value + ', transparent )"></div>'
	}else{
		stat_val.innerHTML = value
	}
	stat.appendChild( stat_val )
	
	stat.appendChild( document.createElement('br'))
	
	destination.appendChild( stat )

}


// const asdf = new Popup({id:"test"})