const env = require('../server/.env.js')

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
	create: `<script type='module' src='/client/js/init_create.js'></script>`,
}

const styles = {
	base: `<link rel='stylesheet' href='/client/css/base.css'>`,
	index: `<link rel='stylesheet' href='/client/css/index.css'>`,
	avatar: `<link rel='stylesheet' href='/client/css/avatar.css'>`,
	world: `<link rel='stylesheet' href='/client/css/world.css'>`,
	popup: `<link rel='stylesheet' href='/client/css/popup.css'>`,
	chat: `<link rel='stylesheet' href='/client/css/chat.css'>`,
	create: `<link rel='stylesheet' href='/client/css/create.css'>`,
	'404': `<link rel='stylesheet' href='/client/css/404.css'>`,
}

const overlays = {
	alert:`
		<div id=alert-contain></div>`,
	world_ui: `
			<div id='world-map'></div>
			<div id='compass'>
				<div>
					<div id='compass-arrow'></div>
					<!--img src='/resource/images/compass-arrow.png'-->
				</div>
			</div>
			<div id='action-bar'></div>`,
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
			<div class='toons'>
			</div>
		</div>`,
	chat:`
		<div id='chat'>
			<div id='chat-toggle'>&#128101;</div>
			<div id='chat-content'>
			</div>
			<input id='chat-input' type='text' placeholder="say:">
		</div>`,
	target:`
		<div id='target' class='dialogue hold-click' data-name='target'>
			<div class='inner'>
				<img id='target-profile' src=''>
			</div>
		</div>
		<div id='target-name'></div>
		<img id='target-item' class='icon'/>
		<div id='status'>
			<div id='target-health' class='bar'>
				<div class='status'></div>
				<div class='readout flex-wrapper'></div>
			</div>
			<div id='target-mana' class='bar'>
				<div class='status'></div>
				<div class='readout flex-wrapper'></div>
			</div>
		</div>`,
	shaders: `
		<script id="fshader" type="x-shader/x-fragment">
			void main(){
				gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 )
			}
		</script>
		<script id="vshader" type="x-shader/x-vertex">
			precision highp float;
			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;
			uniform float time;

			attribute vec3 position;
			attribute vec2 uv;
			attribute vec3 translate;

			varying vec2 vUv;
			varying float vScale;

			void main() {

				vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
				vec3 trTime = vec3(translate.x + time,translate.y + time,translate.z + time);
				float scale =  sin( trTime.x * 2.1 ) + sin( trTime.y * 3.2 ) + sin( trTime.z * 4.3 );
				vScale = scale;
				scale = scale * 10.0 + 10.0;
				mvPosition.xyz += position * scale;
				vUv = uv;
				gl_Position = projectionMatrix * mvPosition;

			}
		</script>
		<div id='wooot'></div>
		<script id="asdf" type="x-shader/x-fragment">
			precision highp float;

			uniform sampler2D map;

			varying vec2 vUv;
			varying float vScale;

			// HSL to RGB Convertion helpers
			vec3 HUEtoRGB(float H){
				H = mod(H,1.0);
				float R = abs(H * 6.0 - 3.0) - 1.0;
				float G = 2.0 - abs(H * 6.0 - 2.0);
				float B = 2.0 - abs(H * 6.0 - 4.0);
				return clamp(vec3(R,G,B),0.0,1.0);
			}

			vec3 HSLtoRGB(vec3 HSL){
				vec3 RGB = HUEtoRGB(HSL.x);
				float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
				return (RGB - 0.5) * C + HSL.z;
			}

			void main() {
				vec4 diffuseColor = texture2D( map, vUv );
				gl_FragColor = vec4( diffuseColor.xyz * HSLtoRGB(vec3(vScale/5.0, 1.0, 0.5)), diffuseColor.w );

				if ( diffuseColor.w < 0.5 ) discard;
			}
		</script>`

	// `
	// 	<script id="vertexShader" type="x-shader/x-vertex">
	// 		precision highp float;

	// 		uniform float sineTime;

	// 		uniform mat4 modelViewMatrix;
	// 		uniform mat4 projectionMatrix;

	// 		attribute vec3 position;
	// 		attribute vec3 offset;
	// 		attribute vec4 color;
	// 		attribute vec4 orientationStart;
	// 		attribute vec4 orientationEnd;

	// 		varying vec3 vPosition;
	// 		varying vec4 vColor;

	// 		void main(){

	// 			vPosition = offset * max( abs( sineTime * 2.0 + 1.0 ), 0.5 ) + position;
	// 			vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) );
	// 			vec3 vcV = cross( orientation.xyz, vPosition );
	// 			vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );

	// 			vColor = color;

	// 			gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

	// 		}

	// 	</script>

	// 	<script id="fragmentShader" type="x-shader/x-fragment">

	// 		precision highp float;

	// 		uniform float time;

	// 		varying vec3 vPosition;
	// 		varying vec4 vColor;

	// 		void main() {

	// 			vec4 color = vec4( vColor );
	// 			color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

	// 			gl_FragColor = color;

	// 		}

	// 	</script>`
}


const render = function( type, request, error ){
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
					${ env.DEV ? '<div id="pass-through" data-email="asdf@asdf.com" data-password="asdfasdf"></div>' : '' }
					<div id='errors'>
						${ error || '' }
					</div>
					<div id='content'>
						<div id='auth-contain'>
							<form id='login-form' method='post' class='auth-form' action='/login'>
								Login
								<input id='login-email' type='email' name='email' placeholder='email'>
								<input id='login-password' type='password' name='password' placeholder='password'>
								<input type='submit' class='submit button'>
								<br>
								<br>
								<div id='forgot-password'>forgot password</div>
							</form>
							<div id='forgot-form'>
								<input type='email'>
								<div id='forgot-submit' class='submit button'>send reset</div>
							</div>
							<form id='register-form' method='post' class='auth-form' action='/register'>
								Register
								<input id='regsiter-email' type='email' name='email' placeholder='email'>
								<input id='register-password' type='password' name='password' placeholder='password'>
								<input id-'register-password-confirm' type='password' placeholder='password again'>
								<input type='submit' class='submit button'>
							</form>
						</div>
						<div id='discord'>
							<a target='_blank' href='https://discord.gg/7Dsjc9V'>
								https://discord.gg/7Dsjc9V
							</a>
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
					<div id='errors'>
						${ error || '' }
					</div>
					<div id='content'>
						<div id='avatars'>
							<div id='avatar-content'>
							</div>
						</div>
					</div>
					<div id='enter-world' class='submit button'>
						<a href='/world'>Enter World</a>
					</div>
					<div id='logout' class='submit button'>
						<a href='/logout'>Logout</a>
					</div>
				</body>
			</html>`
			break;

		case 'create':
			css_includes += styles.create
			js_includes += scripts.create
			return `
			<html>
				<head>
					${ header_info }
					${ css_includes }
					${ js_includes }
				</head>
				<body>
					${ overlays.alert }
					<div id='create'>
						<form action='/create_avatar' method='post'>
							<select id='avatar-race'>
								<option value='human'>human</option>
								<option value='gnome'>gnome</option>
								<option value='elf'>elf</option>
								<option value='dwarf'>dwarf</option>
							</select>
							<div id='create-display'>
								<div id='stats'>

								</div>
								<div id='avatar-image'>
									<img>
								</div>
							</div>
							<input id='avatar-name' type='text' placeholder='avatar name' name='name'>
							<div class='row'>
								<input type='submit' value='create' class='submit button'>
							</div>
						</form>
					</div>
				</body>
			</html>`
			break;

		case 'world':
			css_includes += styles.world + styles.chat + styles.popup
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
					${ overlays.target }
					${ overlays.shaders }
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