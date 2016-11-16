var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
  auth: {
    api_user: 'garciagarciajosemaria',
    api_key: 'prueba1!'
  }
}

var client = nodemailer.createTransport(sgTransport(options));
/*
var client = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'garciagarciajosemaria',
    pass: 'prueba1'
  }
});*/

var email = {
  from: 'josemariagarcia95@gmail.com',
  to: 'xemagg95@gmail.com',
  subject: 'Hello',
  text: 'Hello world',
  html: '<b>Hello world</b>'
};

client.sendMail(email, function(err, info){
    if (err){
      console.log(err);
    }
    else {
      console.log('Message sent: ' + info.response);
    }
});