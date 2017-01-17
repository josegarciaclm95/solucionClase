var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var port = config.port;
var emailUser = config.emailUser;
var emailPass = config.emailPass;
var exp = require("express");
var modelo = require("./servidor/modelo.js");

var app = exp();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var juegofm = new modelo.JuegoFM('./servidor/juego-json.json');
var juego = juegofm.makeJuego();
juego.connectMongo();

/*
var persistencia = require("./servidor/persistencia.js");
persistencia.mongoConnect();
*/
var ObjectID = require("mongodb").ObjectID;
var bodyParser = require("body-parser");

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
  auth: {
    api_user: emailUser,
    api_key: emailPass
  }
}

var client = nodemailer.createTransport(sgTransport(options));
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

var mensaje = {
	from: 'donotanswer@juegoprocesos.com',
	subject: 'Confirme su cuenta',
	text: 'Hello world'
};

app.use(exp.static(__dirname + "/cliente/"));
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

io.on('connection', function (socket) {
	console.log('a user connected');
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
	for (var i = 1; i <= juego.niveles.length; i++) {
		socket.on('chat message ' + i, function (msg) {
			console.log(msg)
			io.emit('chat message ' + msg.nivel, {msg:msg.msg, nombre:msg.nombre, nivel:msg.nivel });
		});
	}
});

app.get("/datosJuego/:id", function (request, response) {
	console.log("Datos juego");
	var id = request.params.id;
	console.log("\t DatosJuego -> \t id - " + id);
	var usuario = juego.buscarUsuarioById(id);
	var res;
	if(usuario && usuario.nivel <= juego.niveles.length){
		res = juego.niveles[usuario.nivel-1];
		if(usuario.nivel == 1){
			juego.addPartida(usuario);
		}
	} else {
		res = {nivel:-1, platforms:[]}	
	}
	console.log("\t DatosJuego -> \t Datos a devolver -> " +  JSON.stringify(res.nivel));
	response.send(res);
});


app.get("/", function (request, response) {
	console.log("Inicio de página");
	var contenido = fs.readFileSync("./cliente/index.html");
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});
app.get("/welcome", function (request, response) {
	console.log("Inicio de página");
	var contenido = fs.readFileSync("./cliente/welcome.html");
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});
app.get("/bad-welcome", function (request, response) {
	console.log("Inicio de página");
	var contenido = fs.readFileSync("./cliente/bad_welcome.html");
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});

app.post('/login/', function(request, response){
	console.log("Login")
	var email_name = request.body.email_name;
	var password = request.body.password;
	if(password != undefined){
		password = encrypt(password);
	}
	console.log(password)
	if (user = juego.comprobarUsuario(email_name,password)){
		console.log("\t Usuario " + user.email + " existe");
		response.send(user);
	} else {
		console.log("\t Usuario " + email_name + " inexistente/inactivo o contrasena erronea. Login fallido");
		response.send({user_name:"ERROR"});
	}
});

app.post("/crearUsuario/", function (request, response) {
	console.log("Crear usuarios")
	var user_name = request.body.user_name;
	var email = request.body.email;
	var pass = request.body.password;
	var urlD = request.body.url;
	var userFound = juego.buscarUsuario(email);
	var time_register = (new Date().valueOf());
	if(!userFound){
		juego.agregarUsuario(user_name,email,encrypt(pass),time_register,false, response)
		var url = urlD + "/confirmarCuenta/" + email + "/" + time_register;
		var html = '¡¡Bienvenido a ConquistaNiveles!! <br/> Confirme su cuenta haciendo clic en el siguiente enlace: <br/>';
		html += '<a href='+url+'>'+url+'</a>';
		mensaje.to = email;
		mensaje.html = html;
		function callbackSendEmail(errr,info){
			if (errr){
				console.log(errr);
				response.send({result:"EmailNotSent"})
			}
			else {
				console.log("\t Crear Usuario -> \t Email enviado");
			}
		}
		client.sendMail(mensaje, callbackSendEmail);
	} else {
		response.send({result:"userExists"})
	}
});

app.get("/confirmarCuenta/:email/:id", function (request, response) {
	console.log("Confirmar cuenta")
	var email = request.params.email;
	var id = parseInt(request.params.id);
	var contenido;
	if(juego.confirmarUsuario(email,id)){
		console.log("\t Confirmar cuenta -> Usuario activado");
		response.setHeader("Location", "/welcome");
	} else {
		console.log("\t Confirmar cuenta -> \t El usuario ya se ha confirmado o no se ha registrado");
		response.setHeader("Location", "/bad-welcome");
	}
	response.statusCode = 302; 
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});

app.post("/modificarUsuario/", function (request, response) {
	console.log("Modificar usuario");
	var oldMail = request.body.old_email;
	var newEmail = request.body.new_email;
	var newPass = request.body.new_password;
	console.log("\t Modificar usuario -> Datos usuario");
	console.log("\t\t Email viejo -> " +oldMail);
	console.log("\t\t Email nuevo -> " +newEmail)
	console.log("\t\t Password nueva -> " +newPass)
	console.log("\t\t Modificar usuario -> Datos usuario");
	var criteria = {"email":oldMail};
	var changes = {"email":newEmail};
	if(newPass != ""){
		changes["password"] = encrypt(newPass);
		newPass = encrypt(newPass);
	}
	persistencia.updateOn("usuarios",criteria,{$set: changes},{},function(err,result){
		if(err){
			console.log(err)
		} else {
			console.log("\t Modificar usuario -> Datos actualizados");
			juego.modificarUsuario(oldMail,newEmail, newPass);
			response.send(result.result);
		}
	});
});

app.delete("/eliminarUsuario/", function (request, response) {
	console.log("Eliminar usuario");
	var email = request.body.email;
	var pass = encrypt(request.body.password);
	console.log("\t Eliminar usuario -> \t Email -> " +email);
	console.log("\t Eliminar usuario -> \t Password -> " +pass)
	var criteria = {"email":email, "password":pass};
	persistencia.removeOn("usuarios",criteria,function(err,result){
		if(err){
			console.log(err)
		} else {
			console.log("Usuario eliminado")
			juego.eliminarUsuario(email);
			response.send(result.result);
		}
	});	
});

app.get("/resultados/", function (request, response) {
	persistencia.getResultados(response);
});	


app.get('/limpiarMongo/', function(request,response){
	juego.limpiarMongoPRUEBAS(response);
	juego = juegofm.makeJuego();
});

app.get('/nivelCompletado/:id/:tiempo/:vidas', function (request, response) {
	console.log("Nivel completado");
	var id = request.params.id;
	var tiempo = parseInt(request.params.tiempo);
	var vidas = parseInt(request.params.vidas);
	var usuario = juego.buscarUsuarioById(id);
	if(usuario != undefined){
		console.log("\t Nivel completado -> \t Usuario encontrado en nivel completado")
		juego.guardarPartida(usuario, tiempo, vidas, response)
		//usuario.agregarResultado(new modelo.Resultado(usuario.nivel,tiempo));
		console.log("\t Nivel completado -> \t Usuario " + id + " - Tiempo " + tiempo + "-  IdJuego - " + usuario.idJuego);
	} else {
		console.log("\t Nivel completado -> \t Usuario NO encontrado en nivel completado")
		usuario = new modelo.Usuario("dummy");
		usuario.nivel = -2;
	}
	console.log("\t Nivel completado -> \tNuevo nivel es ->" + usuario.nivel);
});

app.get('/obtenerResultados/:id', function (request, response) {
	var id = request.params.id;
	var user = juego.buscarUsuarioById(id);
	if(user == undefined){
		user = new modelo.Usuario("dummyRes");
		user.resultados.push(1);
	}
	console.log(juego.getPartida(user).resultados);
	response.send(juego.getPartida(user).resultados);
	//response.send(user.resultados);
});

app.post('/meterEnUsuarios/', function(request, response){
	var user_name = request.body.user_name;
	var email = request.body.email;
	var pass = request.body.password;
	var urlD = request.body.url;
	var time_register = (new Date().valueOf());
	var act = JSON.parse(request.body.activo);
	//console.log(pass)
	juego.insertarUsuarioPRUEBAS(user_name,email,encrypt(pass),time_register,act,response);
});

/**
 * CURSOR HANDLER. Clase para facilitar la refactorizacion de los metodos que trabajan con cursores
 */
function CursorHandler(){
	var self = this;
	this.emptyCursorCallback = function(users){

	};
	this.cursorWithSomethingCallback = function(users){

	};
	this.checkCursor = function(err,result){
		if(result.length == 0){
			self.emptyCursorCallback(result);
		} else {
			self.cursorWithSomethingCallback(result);
		}
	}
}

console.log("Servidor escuchando en el puerto "+process.env.PORT );
//app.listen(process.env.PORT || port);
http.listen(process.env.PORT || port, function(){
  console.log('Listening on port ' + port);
});