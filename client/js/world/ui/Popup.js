import POPUPS from './POPUPS.js'

export default class Popup {
	
	constructor( init ){

		init = init || {}

		if( !init.id ){
			console.log('cannot init popup without id')
			return false
		}

		const ref = this

		this.mousedown = false
		this.lastX = 0
		this.lastY = 0
		this.curX = 100
		this.curY = 50
		this.diffX = 0
		this.diffY = 0

		this.element = document.createElement('div')
		this.element.classList.add('popup')
		this.element.id = init.id

		this.title = document.createElement('div')
		this.title.classList.add('title')
		this.title.innerHTML = init.id
		this.element.appendChild( this.title )

		this.topbar = document.createElement('div')
		this.topbar.classList.add('topbar')
		this.topbar.addEventListener('mousedown', function(e){
			ref.mousedown = true
			ref.lastX = e.clientX
			ref.lastY = e.clientY
		})
		this.topbar.addEventListener('mousemove', function(e){
			if( ref.mousedown ){
				ref.diffX = e.clientX - ref.lastX
				ref.diffY = e.clientY - ref.lastY
				ref.curX = ref.curX + ref.diffX
				ref.curY = ref.curY + ref.diffY
				ref.element.style.top = Math.floor( ref.curY ) + 'px'
				ref.element.style.left = Math.floor( ref.curX ) + 'px'
				ref.lastX = e.clientX
				ref.lastY = e.clientY
			}	
		})
		this.topbar.addEventListener('mouseup', function(e){
			setTimeout(function(){
				ref.mousedown = false
			}, 10)
		})
		this.element.appendChild( this.topbar )

		this.close = document.createElement('div')
		this.close.classList.add('close')
		this.close.innerHTML = 'X'
		this.close.addEventListener('click', function(){
			ref.element.style.display = 'none'
		})
		this.element.appendChild( this.close )

		this.content = document.createElement('div')
		this.content.classList.add('content')
		this.element.appendChild( this.content )

		POPUPS[ init.id ] = this

		document.body.appendChild( POPUPS[ init.id ].element )

	}

	show(){
		this.element.style.display = 'inline-block'
		this.element.style.left = this.curX
		this.element.style.top = this.curY
	}

	hide(){
		this.element.style.display = 'none'
	}

	render(){
		console.log('this popups render has not been defined')
	}

}