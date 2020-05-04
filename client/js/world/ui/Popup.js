window.POPUPS = {};
// function topbarElements(){
    
// }
export default class Popup {
	
	constructor( options = {} ){

        this.options = options;
        
		if( !options.id ){
			console.log('cannot init popup without id')
			return false
		}

		const ref = this
        
        this.w = 200;
        this.h = 124;
        this.topbarHeight = 16;

		this.mousedown = false
		this.lastX = 0
		this.lastY = 0
		this.curX = 100
		this.curY = 0
		this.diffX = 0
		this.diffY = 0
        
        this.init()

		POPUPS[ options.id ] = this

		document.body.appendChild( POPUPS[ options.id ].element )

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
    }

    initEvents() {
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
        const mousemove = e => {
			if( this.mousedown ){
				this.curX = e.clientX - this.diffX
				this.curY = e.clientY - this.diffY
				this.element.style.top = Math.floor( this.curY ) + 'px'
				this.element.style.left = Math.floor( this.curX ) + 'px'
				this.lastX = e.clientX
				this.lastY = e.clientY
			}	
		};
        const mouseup = e => {
			this.mousedown = false
		};
        
        this.topbar.addEventListener('mousedown', mousedown)
		window.addEventListener('mousemove', mousemove)
		window.addEventListener('mouseup', mouseup)
        
        this.topbar.addEventListener('touchstart', mousedown)
		window.addEventListener('touchmove', mousemove)
		window.addEventListener('touchend', mouseup)
        
        this.close.addEventListener('click', () => {
			this.hide()
		})
    }
    
	show(){
		
		this.render()

		this.element.style.display = 'inline-block'
		this.element.style.left = this.curX
		this.element.style.top = this.curY
	}

	hide(){
		this.element.style.display = 'none'
		this.content.innerHTML = ''
	}

	render(){
		console.log('this popups render has not been defined')
	}

}

// const asdf = new Popup({id:"test"})