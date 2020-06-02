const log = require('./log.js')
const env = require('./.env.js')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	host: 'mail.oko.nyc',
	service: 'smtp',
	port: 587,
	secure: false,
	requireTLS: true,
	tls: {
		rejectUnauthorized: false
	},
	auth: {
		user: 'info@oko.nyc',
		pass: env.MAIL_PW
	}
});

const mailOptions = {
	from: 'info@oko.nyc',
	to: 'kerryoco@gmail.com',
	subject: 'A sample email from multymud',
	text: 'That was easy!'
};

if( env.MAIL_PW ){
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			log('flag', 'mail error: ', error);
		} else {
			log('mail', 'Email sent: ' + info.response);
		}
	})
}else{
	log('mail', 'skipping mail send: ', mailOptions.to )
}