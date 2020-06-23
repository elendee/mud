const bcrypt = require('bcryptjs')

// const User = require('../models/User.js');
// const Avatar = require('../models/Avatar.js');

const log = require('./log.js')
const env = require('./.env.js')
const lib = require('./lib.js')

// const axp = require('./pure.js');
// const axst = require('./state.js');

const DB = require('./db.js')
// const ax_parcel = require('./_parcel.js');

const SALT_ROUNDS = 10

const User = require('./User.js')

const Toon = require('./agents/Toon.js')

const { transporter } = require('./mail.js')

log('call', 'auth.js')






async function login_user( request ){

	const email = request.body.email.toLowerCase().trim()
	const password = request.body.password.trim()

	let msg

	if( !password ) msg = 'no password given for login'
	if( !email ) msg = 'no email given for login'
	if( !request.session.USER ) msg = 'invalid login attempt'

	if( msg ){
		return {
			success: false,
			msg: msg
		}
	}

	if( request.session.USER._id && request.session.USER.email === email ){
		return { success: true }
	}

	const pool = DB.getPool()

	const user = await select_user( 'email', email )
	if( !user ) return {
		success: false,
		msg: 'no user found for login'
	}

	const hash_pw = user.password

	const bcrypt_boolean = await bcrypt.compare( password, hash_pw )

	if( bcrypt_boolean ){

		request.session.USER = new User( user )

		return {
			success: true
		}

	}else{

		return {
			success: false,
			msg: 'failed to auth'
		}

	}

}



async function register_user( request ){

	// should always be the case if routing correctly
	if( !request.session.USER ){
		return {
			success: false,
			msg: 'invalid register attempt'
		}
	}

	if( request.session.USER._id || request.session.USER.level > 0 ){
		return {
			success: false,
			msg: 'user already exists'
		}
	}

	const pool = DB.getPool()

	const email = request.body.email.toLowerCase().trim()
	const pw = request.body.password.trim()

	let invalid = false
	if( !lib.is_valid_email( email )){
		invalid = 'invalid email'
	}else if( !lib.is_valid_password( pw )){
		invalid = 'invalid password'
	}
	if( invalid ){
		return {
			success: false,
			msg: invalid
		}
	}

	let salt = bcrypt.genSaltSync( SALT_ROUNDS )
	let hash = bcrypt.hashSync( pw, salt )

	const sql = 'INSERT INTO `users` (`email`, `password`, `level`, `confirmed`) VALUES ( ?, ?, 1, false )'

	const { error, results, fields } = await pool.queryPromise( sql, [ email, hash ] ) // , ( err, result ) => { // INSERT does not return fields
	if( error ){
		log('flag', 'err: ', Object.keys( error ), error.code )
		let msg = 'unable to register'
		if( error.code === 'ER_DUP_ENTRY' ) msg = 'email already registered'
		return {
			success: false,
			msg: msg
		}
	}

	const user = await select_user( 'id', results.insertId )

	request.session.USER = new User( user ) // should be app logic: new User( res )

	return { success: true }	

}






async function select_user( type, value ){

	const pool = DB.getPool()

	let field
	if( type == 'email' ){
		field = '`email`'
	}else if( type == 'id' ){
		field = '`id`'
	}else{
		log('flag', 'invalid user lookup', type )
		resolve({
			success: false,
			msg: 'invalid user lookup'
		})
		return false
	}

	const sql = 'SELECT * from `users` WHERE ' + field + ' = ? LIMIT 1'

	const { error, results, fields } = await pool.queryPromise( sql, [ value ] ) 

	if( error )  log('flag', 'error retrieving user: ', error )
	
	return results[0]

}




const logout_user = async( request ) => {

	let msg = 'user saved'

	if( request.session.USER && request.session.USER._id ){

		const r = await request.session.USER.save() // auto stamps
		if( !r || !r.success )  log('flag', 'error saving user during logout (proceeding) ', r )

	}else{

		msg = 'no user found to logout'

	}

	request.session.destroy()

	return {
		success: true,
		msg: msg
	}

}







const fetch_avatars = async( request, avatar_id ) => {

	const pool = DB.getPool()

	let sql, value
	if( avatar_id ){
		sql = 'SELECT * FROM avatars WHERE id=?'
		value = avatar_id
	}else{
		sql = 'SELECT * FROM avatars WHERE user_key=?'
		value = request.session.USER._id
	}

	const { error, results, fields } = await pool.queryPromise( sql, [ value ] )
	if( error ) return {
		success: false,
		msg: 'invalid fetch avatars'
	}

	if( !results || !results.length ) return {
		success: true,
		avatars: []
	}

	for( let avatar of results ){
		avatar = new Toon( avatar )
	}

	return { 
		success: true, 
		avatars: results 
	}

}



const create_avatar = async( request ) => {

	if( !lib.is_valid_name( request.body.name ) ) return {
		success: false,
		msg: 'invalid avatar name'
	}

	if( !request.session.USER || !request.session.USER._id )	return {
		success: false,
		msg: 'no user found for avatar'
	}

	const pool = DB.getPool()

	const sql = 'INSERT INTO avatars (user_key, `name`, race, strength, vitality, dexterity, perception, luck, intellect, speed ) VALUES (?,?,?,?,?,?,?,?,?,?)'

	const { error, results, fields } = await pool.queryPromise( sql, [ 
		request.session.USER._id, 
		lib.validate_string( request.body.name ),
		lib.validate_string( request.body.race ),
		lib.validate_number( Number( request.body.stats.strength ), 0 ),
		lib.validate_number( Number( request.body.stats.vitality ), 0 ),
		lib.validate_number( Number( request.body.stats.dexterity ), 0 ),
		lib.validate_number( Number( request.body.stats.perception ), 0 ),
		lib.validate_number( Number( request.body.stats.luck ), 0 ),
		lib.validate_number( Number( request.body.stats.intellect ), 0 ),
		lib.validate_number( Number( request.body.stats.speed ), 0 ),
	])
	if( error ) {
		log('flag', 'err: ', error )
		return {
			success: false,
			msg: 'invalid insert avatars'
		}
	}

	if( results.affectedRows === 1 && typeof results.insertId === 'number' ){
		const res = await fetch_avatars( false, results.insertId )
		if( !res || !res.success ) return {
			success: false,
			msg: 'error creating avatar'
		}
		
		// request.session.USER.active_avatar = results.insertId
		request.session.USER.active_avatar = request.body.name

		const sess_save = await new Promise((resolve, reject)=>{
			request.session.save(function(err){
				if( err ) reject( err )
				resolve('oko')
			})
		})
		return {
			success: true,
			avatar: res.avatars[0]
		}

	}

	return { 
		success: false, 
		msg: 'avatar creation error'
	}

}



const reset = ( request ) => {

	return new Promise(function(resolve, reject){

		if( !lib.is_valid_email( request.body.email ) ){
			resolve({
				success: false,
				msg: 'invalid email'
			})
			return false
		}

		if( !env.MAIL_PW ){
			log('mail', 'skipping email: ', request.body.email )
			resolve({
				success: false,
				msg: 'skipping resets'
			})
			return false
		}

		const mailOptions = {
			from: 'info@oko.nyc',
			to: request.body.email,
			subject: 'mud password reset',
			text: 'click <a href="https://mud.oko.nyc/reset">https://mud.oko.nyc/reset</a> to reset password'
		};

		log('mail', 'skipping email resets')
		resolve({
			success: false,
			msg: 'email resets coming very soon, sorry!  Email multyplecks@zoho.com until then.'
		})

		// transporter.sendMail( mailOptions, function( error, info ){
		// 	if (error) {
		// 		log('flag', 'mail error: ', error)
		// 		reject('sendmail error')
		// 	} else {
		// 		log('mail', 'Email sent: ' + info.response)
		// 		resolve({
		// 			success: true,
		// 			msg: 'email sent'
		// 		})
		// 	}
		// })

	})

}


	// const update = 'INSERT INTO `' + doc._table + '` (' + field_string + ') VALUES (' + value_string + ') ON DUPLICATE KEY UPDATE ' + full_string

	// log('query', 'attempting UPDATE: ', update )

	// const { error, results, fields } = await pool.queryPromise( update )

	// if( error || !results ){
	// 	if( error ){
	// 		log('flag', 'update err:', error.sqlMessage )
	// 		return false
	// 	}else{
	// 		// throw new Error( 'UPDATE error: ', error.sqlMessage, 'attempted: ', '\nATTEMPTED: ', update, doc._table )
	// 		throw new Error( 'no results: ' + update )
	// 	}
	// }

	// log('query', 'results: ', JSON.stringify( results ) )

	// return {
	// 	msg: 'update success',
	// 	id: results.insertId
	// }







module.exports = {
	register_user,
	select_user,
	login_user,
	logout_user,
	fetch_avatars,
	create_avatar,
	reset
}








