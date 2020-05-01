const header_info = `
	<title>MUD</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">
	<meta name="Description" content="a mud">
	<meta property="og:url" content="https://mud.oko.nyc">
	<meta property="og:title" content="okomud">
	<meta property="og:description" content="javascript MUD"> 
	<meta property="og:image" content="https://mud.oko.nyc/resource/media/featured-image.png"/>`

const scripts = {
	base: `<script src='/client/js/base.js'></script>`,
	auth: `<script type='module' src='/client/js/init_auth.js'></script>`,
	world: `<script type='module' src='/client/js/init_world.js'></script>`,
	avatar: `<script type='module' src='/client/js/init_avatar.js'></script>`,
}

const styles = {
	base: `<link rel='stylesheet' href='/client/css/base.css'>`,
	index: `<link rel='stylesheet' href='/client/css/index.css'>`,
	avatar: `<link rel='stylesheet' href='/client/css/avatar.css'>`,
	world: `<link rel='stylesheet' href='/client/css/world.css'>`,
	chat: `<link rel='stylesheet' href='/client/css/chat.css'>`,
	'404': `<link rel='stylesheet' href='/client/css/404.css'>`,
}

const overlays = {
	alert:`
		<div id=alert-contain></div>`,
	world_ui: `
		<div id='world-ui'>
			<!--div id='world-map'></div-->
			<div id='action-bar'></div>
		</div>`,
	dev: `
		<div id='dev'>
			<div class='coords'>
			</div>
			<div class='crowd'>
			</div>
			<div class='anim-modulo'>
			</div>
			<div class='zones'>
			</div>
		</div>`,
	chat:`
		<div id='chat'>
			<div id='chat-content'>
			</div>
			<input id='chat-input' type='text' placeholder="say:">
		</div>`
}


const render = function( type, request ){
	let css_includes = styles.base
	let js_includes = scripts.base
	switch( type ){
		case 'index':
			css_includes += styles.index
			js_includes += scripts.auth
			return `
			<html>
				<head>
					${ header_info }
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					${ overlays.alert }
					<div id='content'>
						<div id='auth-contain'>
							<form id='login-form' method='post' class='auth-form' action='/login'>
								Login
								<input id='login-email' type='text' name='email' placeholder='email'>
								<input id='login-password' type='password' name='password' placeholder='password'>
								<input type='submit' class='submit button'>
							</form>
							<form id='register-form' method='post' class='auth-form' action='/register'>
								Register
								<input id='regsiter-email' type='email' name='email' placeholder='email'>
								<input id='register-password' type='password' name='password' placeholder='password'>
								<input id-'register-password-confirm' type='password' placeholder='password again'>
								<input type='submit' class='submit button'>
							</form>
						</div>
						<div id='play-contain'>
							<form id='play-form' method='post' action='/world'>
								<input type='hidden' name='play' value='human'>
								<input type='hidden' name='email' value='hpot'>
								<input type='submit' class='submit button' value='play'>
							</form>
						</div>
					</div>
				</body>
			</html>`
			break;

		case 'avatar':
			css_includes += styles.avatar
			js_includes += scripts.avatar
			return `
			<html>
				<head>
					${ header_info }
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					${ overlays.alert }
					<div id='content'>
						avatar....
					</div>
				</body>
			</html>`
			break;

		case 'world':
			css_includes += styles.world + styles.chat
			js_includes += scripts.world
			return `
			<html>
				<head>
					${ header_info }
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					${ overlays.dev }
					${ overlays.alert }
					${ overlays.world_ui }
					${ overlays.chat }
				</body>
			</html>`
			break;

		default: 
			css_includes += styles['404']
			return `<html>
				<head>
					${ header_info }
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					${ overlays.alert }
					<div id='content'>
						<div>
							<p>
								you are adrift at sea...
							</p>
							<p>
								<a href='/'>back to mainland</a>
							</p>
						</div>
					</div>
				</body>
			</html>`
			break;break;
	}
}


module.exports = render