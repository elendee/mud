
// NATIVE PACKAGES
const host = require('os').hostname()
const express = require('express')
const http = require('http')
const fs = require('fs')
const os = require('os')

// LOCAL PACKAGES
const log = require('./server/log.js')
const lib = require('./server/lib.js')
const DB = require('./server/db.js')
// const config = require('./config.js')
const env = require('./server/.env.js')
// const env = require(!fs.existsSync("env.js") ? './default_env.js' : './.env.js')

// NPM 
const bodyParser = require('body-parser')
const session = require('express-session')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const FormData = require('express-form-data')
const mkdirp = require('mkdirp')
const uuid = require('uuid').v4
// const { parse } = require('node-html-parser')

const node_fetch = require('node-fetch')
const { unzip, deflate, inflate, gunzip } = require('zlib')


const User = require('./server/User.js')

const MemoryStore = require('memorystore')(session)

// const uuid = require('uuid').v4

const GAME = require('./server/GAME.js')

// const ROUTER = require('./server/ROUTER.js')

const SOCKETS = require('./server/SOCKETS.js')

// const lib = require('./lib.js')
const WSS = require('./server/WSS.js')

const MAP = require('./server/MAP.js')

const auth = require('./server/auth.js')

// const readline = require('readline')

log('call', 'mud.js')

const STORE = new MemoryStore({
	checkPeriod: 1000 * 60 * 60 * 24 * 2// prune expired entries every 24h
})

const render = require('./client/mud_html.js')

// const mail = require('./server/mail.js')

// CACHED SESSIONS
const lru_session = session({
	cookie: { maxAge: 1000 * 60 * 60 * 24 * 2 },
	resave: false,
	saveUninitialized: true,
	store: STORE,
	secret: env.SECRET
})



// const version = 14

const gatekeep = function(req, res, next) {

	if( req.path.match(/\/resource/) || req.path.match(/\/client/) || req.path.match(/favicon/) ){

		// log('flag', 'resource: ', req.path )

		next()

	}else if( req.path.match(/\/register/) || req.path.match(/\/login/) || req.path.match(/\/logout/) ){

		req.session.USER = new User( req.session.USER )

		next()

	}else{

		// log('flag', 'old blorble: ', req.session.blorble )

		// const hhttp_b = 'heres an http blorble: ' + Date.now()

		// log('flag', 'saved to http blorble: ', hhttp_b )

		// req.session.blorble = 	hhttp_b

		// log('flag', 'whos dis user: ', req.session.USER )

		// req.session.USER = new User( req.session.USER )

		log('gatekeep', req.path )

		next()

	}

}

const exp = new express()

const server = http.createServer( exp )



// const upload = multer({
//   dest: env.UPLOAD_DIR
// })


const FormData_options = {
  uploadDir: os.tmpdir(),
  autoClean: true
}
 
// parse data with connect-multiparty. 
exp.use( FormData.parse( FormData_options ) )
// delete from the request all empty files (size == 0)
exp.use( FormData.format() )
// change the file objects to fs.ReadStream 
// exp.use( FormData.stream() )
// union the body and the files
// exp.use( FormData.union() )






// HTTP ROUTER
// exp.set( 'port', env.PORT )

exp.use('/client', express.static( './client' )) // __dirname + 
// exp.use('/static', express.static( '/resource' )) // __dirname + 
exp.use('/resource', express.static( './resource' )) // __dirname + 
exp.use('/fs', express.static( '/fs' )) // __dirname + 
exp.use('/favicon.ico', express.static( '/resource/favicon.ico') )
// exp.use('/fs', express.static(__dirname + '/fs'))
exp.use( bodyParser.json({ 
	type: 'application/json' 
}))
exp.use( bodyParser.urlencoded({
  extended: true
}));
// exp.use( upload.array() )

exp.use( lru_session )

exp.use( gatekeep )

// routing
exp.get('/', function(request, response) {
	if( request.session.USER && request.session.USER._id ){
		response.send( render( 'avatar', request ) )
	}else{
		response.send( render( 'index', request ) )
	}
})

exp.get('/fetch_avatars', function( request, response ){
	auth.fetch_avatars( request )
	.then( res => {
		response.json( res )
	})
	.catch( err => {
		log('flag', 'err fetching avatars: ', err )
		response.json({
			success: false,
			msg: 'failed to fetch avatars'
		})
	})
})

exp.post('/create_avatar', function( request, response ){
	auth.create_avatar( request )
	.then( res => {
		response.json( res )
	})
	.catch( err => {
		log('flag', 'err creating avatar: ', err )
		response.json({
			success: false,
			msg: 'failed to create avatar'
		})
	})
})

// exp.get('/test', function( request, response) {
// 	log('flag', Object.keys(h).length )
// })

exp.post('/register', function( request, response ){
	auth.register_user( request )
	.then( res => {
		if( res.success ){
			response.send( render( 'avatar' ) )
		}else{
			response.send( render( 'index', request, res.msg ) )
		}
	}).catch( err => {
		log('flag', 'err register: ', err )
		response.send( render('index', request, 'invalid attempt') )
	})
})

exp.post('/login', function( request, response ){
	auth.login_user( request )
	.then( res => {
		if( res.success ){
			response.send( render( 'avatar' ) )
		}else{
			response.send( render( 'index', request, res.msg ) )
		}
	}).catch( err => {
		log('flag', 'err login: ', err )
		response.send( render('index'), request, 'invalid login attempt' )
	})
})

exp.use('/world', function( request, response ){
	// if( request.session.USER && request.session.USER._id ){
	// 	response.send( render( 'avatar', request ) )
	// }else{
	// 	response.send( render( 'index', request ) )
	// }
	if( request.query.avatar && request.session.USER ){
		// log('flag', 'av: ', request.query.avatar )
		request.session.USER.active_avatar = request.query.avatar
	}

	response.send( render('world') )
	
})

exp.get('/create', function(request, response ){
	if( request.session.USER && request.session.USER._id ){
		response.send(render('create') )
	}else{
		response.send( render( 'index', request ) )
	}
})

exp.get('/map', function( request, response ){
	response.json( MAP )
})

exp.use('/logout', function( request, response ){
	auth.logout_user( request )
	.then( res => {
		// includes success false's :
		response.send( render( 'index', request ))
		// response.json( res )
	}).catch( err => {
		log('flag', 'err logout: ', err )
		response.send( render('index'))
		// response.json({
		// 	success: false,
		// 	msg: 'error logging out'
		// })
	})
})

exp.post('/update', function( request, response ){
	auth.update( request )
	.then( res => {
		// includes success false's :
		response.json( res )
	}).catch( err => {
		log('flag', 'err update: ', err )
		response.json({
			success: false,
			msg: 'error updating'
		})
	})
})


exp.post('/reset', function( request, response ){
	auth.reset( request )
	.then( res => {
		// includes success false's :
		response.json( res )
	}).catch( err => {
		log('flag', 'err reset pw: ', err )
		response.json({
			success: false,
			msg: 'reset password error'
		})
	})
})



// exp.post('/img_handler', function( request, response ){

// 	if( request.files && request.session.USER.name ){

// 		const FILE = request.files.upload

// 		const slot_mud_id = request.body.slot_mud_id
// 		const title = request.body.title
// 		const description = request.body.description

// 		const tempPath = FILE.path

// 		const file_URL = `${ Date.now() }__${ FILE.originalFilename }`
// 		const mud_idPath = env.UPLOAD_DIR + request.session.USER.mud_id

// 		const finalPath = mud_idPath + '/' + file_URL

// 		if( '(check valid)' == '(check valid)' ){

// 			mkdirp( mud_idPath, { mode: '0744' })
// 			.then( res => {

// 				// fs.rename( tempPath, finalPath, err => {
// 				fs.rename( tempPath, finalPath, err => {
					
// 					if( err ) {
// 						log('flag', 'filepath err: ', err)
// 						response.status(500).end()
// 					}

// 					// log('flag', 'request.session.USER.website: ', request.session.USER )

// 					GAME.add_img_upload( request.session.USER.mud_id, slot_mud_id, file_URL, description, title )
// 					.then( res => {
// 						if( res.success ){
// 							response.json({
// 								success: true
// 							})
// 						}else{
// 							log('flag', 'new img fail: ', res )
// 							response.json({
// 								success: false,
// 								msg: 'failed to set image'
// 							})
// 						}
// 					}).catch( err => { log('flag', 'error setting image: ', err ) })

// 				})

// 			}).catch( err => {
// 				log('flag', 'err saving upload', err )
// 		    	response.status(500).end()
// 		    	return false
// 			})

// 		}else{

// 			fs.unlink( tempPath, err => {
// 				if( err ) return false
// 				response.status(403).contentType('text/plain').end('invalid file upload')
// 			})

// 		}

// 	}else{
// 		log('flag', 'no file')
// 		response.end()
// 	}
// })

exp.post('*', function(request, response){
	log('router', '404 POST: ' + request.url)
	if( request.url.match(/\.html$/) ){
		response.send( render('404'))
	}else{
		response.send( render('404'))
		// response.end()
	}
})

exp.get('*', function(request, response){
	log('router', '404 GET: ' + request.url)
	if( request.url.match(/\.html$/) ){
		response.send( render('404'))
	}else{
		response.send( render('404'))
		// response.end()
	}
})






















DB.initPool(( err, pool ) => {

	if( err ) return console.error( 'no db: ', err )
	
	log('db', 'init:', Date.now() )
  
	server.listen( env.PORT, function() {
		log( 'boot', `\n
          ,-'''-.
       ,-'       \`-.
     ,'             \`.
   ,'                 \`.
  /                     \\
 /                       \\
+-------------------------\\--------------------------
                           \\                       /
                            \\                     /   
                             \`.                 ,'
                               \`.             ,'
                                 \`-.       ,-'
                                    \`-,,,-'\n
\n ${ host }: ${ env.PORT }
\n ${ Date.now() } 
\n` )
	})

	server.on('upgrade', function( request, socket, head ){

		lru_session( request, {}, () => {
			// if ( !request.session.USER ) {
			// 	log('flag', 'no user, aborting')
			// 	socket.destroy()
			// 	return
			// }

			log('wss', 'session parsed')

			WSS.handleUpgrade( request, socket, head, function( ws ) {
				WSS.emit('connection', ws, request )
			})
		})
	})

	WSS.on('connection', function connection( socket, req ) {

		// log('wss', 'socket connection ', req.session.USER.name )
		socket.request = req

		// log('wss', 'stuff...'  )///socket.request.session.save

		// USER not a User yet...
		// const this_save  = 'savd from socket: ' + Date.now()

		// socket.request.session.blorble = this_save
		// socket.request.session.save( function(){
		// 	console.log('saved......', this_save )
		// })

		if( Object.keys( SOCKETS ).length >= env.MAX_CONNECTIONS ) {
			log('flag', 'max capacity')
			return false
		}

		if( !GAME.pulse ) {

			if( GAME.opening ){ // extremely unlikely
			
				socket.send(JSON.stringify({
					type: 'error',
					msg: 'tried to join during server start - try again in a few seconds'
				}))

			}else{

				GAME.opening = true

				GAME.init_async_elements()
				.then( res => {
			
					GAME.opening = false
			
					GAME.init_sync_elements()
			
					GAME.init_user( socket )
					.catch( err => {
						socket.send(JSON.stringify({ type: 'error', msg: 'failed to initialize user'}))
						log('flag', 'err init user:', err )
					})

					// mail
			
				})
				.catch( err => {
					log('flag', 'err opening GAME: ', err )
				})

			}

		}else{

			GAME.init_user( socket )

		}

	})

})
















if( env.ACTIVE.serverlog ){ 

	const readline = require('readline')
	
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: 'serverlog> \n'
	})
	
	setTimeout(function(){
		rl.prompt()
	}, 500)

	// let readline_last = []
	
	rl.on('line', ( line ) => {

		if( env.READLINE_LITERAL ){	// Mac terminal reads the characters outputted by 'up' literally (?)
			// switch ( line.trim() ) {
			// 	case '^[[A':
			// 		log('flag', 'wut')
			// 		try_readline( readline_last[0] )
			// 		break
			// 	default:
			// 		readline_last.unshift( line.trim() )
			//	break
			// }
		}else{
			try_readline( line.trim() )
		}

		rl.prompt()
	}).on('close', () => {
		process.exit( 0 )
	})

}

function try_readline( msg ){
	try{ 
		log( 'serverlog', eval(`${ msg }`) ) //), '\n(command): ' + String( msg ) )
		log( 'serverlog', String( msg ) )
	}catch( e ){
		log('serverlog', 'fail: ', e )
	}
}



function hal( type, msg, time ){

	for( const mud_id of Object.keys( SOCKETS ) ){

		SOCKETS[ mud_id ].send(JSON.stringify({
			type: 'hal',
			hal_type: type,
			msg: msg,
			time: time
		}))

	}

}


// function heap(){
// 	const mem = process.memoryUsage()
// 	for (const key in mem) {
// 		console.log(`${key} ${Math.round(mem[key] / 1024 / 1024 * 100) / 100} MB`);
// 	}
// }

// class Mapcell {
// 	constructor( init ){
// 		this.id = init.id
// 		this.x = init.x
// 		this.y = init.y
// 		this.z = init.z
// 	}
// }

// let h = {};

// (function( width, height ){
// 	const total = width * height
// 	let id
// 	for( let i = 0; i < total; i++ ){
// 		id = uuid()
// 		h[ id ] = new Number()
// 		// Mapcell({
// 			// id: id,
// 			// x: i % width,
// 			// y: Math.random(),
// 			// z: Math.floor( i / width )
// 		// })
// 	}
// })( 1000, 1000 )

