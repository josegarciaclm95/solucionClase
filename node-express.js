var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var port = config.port;
var emailUser = config.emailUser;
var emailPass = config.emailPass;
var exp = require("express");
var modelo = require("./servidor/modelo.js");
var app = exp();
var juegofm = new modelo.JuegoFM('./cliente/js/juego-json.json');
var juego = juegofm.makeJuego();

var persistencia = require("./servidor/persistencia.js");
persistencia.mongoConnect();

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

app.get("/datosJuego/:id", function (request, response) {
	var id = request.params.id;
	var usuario = juego.buscarUsuarioById(id);
	var res;
	console.log("LLamada a datosJuego, id - " + id);
	console.log("Usuario encontrado ");
	if(usuario && usuario.nivel <= juego.niveles.length){
		res = juego.niveles[usuario.nivel-1];
	} else {
		res = {nivel:-1, platforms:[]}	
	}
	console.log("Datos a devolver -> " +  JSON.stringify(res.nivel));
	response.send(res);
});


app.get("/", function (request, response) {
	console.log("Inicio de página");
	var contenido = fs.readFileSync("./cliente/index.html");
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});

app.post('/login/', function(request, response){
	var email = request.body.email;
	var password = request.body.password;
	var criteria = {"nombre":email};
	if (password != undefined){
		criteria["password"] = encrypt(password);
	}
	function callbackLogin(err,cursor){
		if(err){
			console.log(err)
		} else {
			var cursorHandler = new CursorHandler();
			cursorHandler.emptyCursorCallback = function(users){
				console.log("No existe el usuario " + email);
				response.send({nivel:-1});
			} 
			cursorHandler.cursorWithSomethingCallback = function(users){
				var u = new modelo.Usuario(users[0].nombre);
				u.id = users[0]._id;
				u.maxNivel = juego.niveles.length;
				persistencia.addNewResults(u);
				juego.agregarUsuario(u);
				console.log("Usuario " + u.nombre + " agregado en Login");
				//console.log(u);
				response.send(u);
			}
			cursor.toArray(cursorHandler.checkCursor);
		}
	}
	persistencia.findSomething("usuarios",criteria,callbackLogin);
});

app.post("/crearUsuario/", function (request, response) {
	var email = request.body.email;
	console.log(email)
	var pass = request.body.password;
	var urlD = request.body.url;
	var criteria = {"nombre":email};
	function callbackCrearUsuario(err,cursor){
		if(err){
			console.log(err);
		} else {
			var cursorHandler = new CursorHandler();
			cursorHandler.cursorWithSomethingCallback = function(users){
				console.log("El usuario ya existe en usuarios(crearUsuario)");
				response.send({result:"userExists"})
			}
			cursorHandler.emptyCursorCallback = function(users){
				console.log("No existe el usuario (crearUsuario) en usuarios");
				var criteria = {"email":email};
				function callbackCrearUsuarioLimbo(err,cursor){
					if(err){
						console.log(err)
					} else {
					var cursorHandlerInt = new CursorHandler();
						cursorHandlerInt.emptyCursorCallback = function(userss){
							var time = (new Date().valueOf());
							var url = urlD + "/confirmarCuenta/" + email + "/" + time;
							console.log(url)
							var html = '¡¡Bienvenido a ConquistaNiveles!! <br/>';
							html += 'Confirme su cuenta haciendo clic en el siguiente enlace: <br/>';
							html += '<a href='+url+'>'+url+'</a>';
							mensaje.to = email;
							mensaje.html = html;
							function callbackSendEmail(errr,info){
								if (errr){
									console.log(errr);
									response.send({result:"EmailNotSent"})
								}
								else {
									console.log('Message sent: ' + info.response);
									persistencia.insertOn("limbo",{email:email,password:encrypt(pass),tiempo:time},function(err,data){
										if(err){
											console.log(err)
										} else {
											response.send({result:"confirmEmail"})
										}
									})
								}
							}
							client.sendMail(mensaje, callbackSendEmail);
						}
						cursorHandlerInt.cursorWithSomethingCallback = function(userss){
							console.log("El usuario ya existe en limbo(crearUsuario)");
							response.send({result:"userExists"})
						}
						cursor.toArray(cursorHandlerInt.checkCursor)
					}
				}
				persistencia.findSomething("limbo",criteria,callbackCrearUsuarioLimbo)
			}
			cursor.toArray(cursorHandler.checkCursor)
		}
	}
	persistencia.findSomething("usuarios",criteria,callbackCrearUsuario)
});

app.get("/confirmarCuenta/:email/:id", function (request, response) {
	console.log("Llamada a confirmar cuenta")
	var email = request.params.email;
	var id = parseInt(request.params.id);
	var criteria = {email:email,tiempo:id};
	function callbackConfirmar(err,cursor){
		if(err){
			console.log(err);
		} else {
			var cursorHandler = new CursorHandler();
			cursor.emptyCursorCallback = function(users) {
				console.log("El usuario ya existe");
				response.redirect("/");
			}
			cursorHandler.cursorWithSomethingCallback = function(users){
				console.log("Confirmar - Existe el usuario");
				var usuario = new modelo.Usuario(email);
				persistencia.insertUser(usuario,users[0].password);
				persistencia.removeOn("limbo",{email:email},function(){})
				response.redirect("/");
			}
			cursor.toArray(cursorHandler.checkCursor);
		}
	}
	persistencia.findSomething("limbo",criteria,callbackConfirmar)
});

app.post("/modificarUsuario/", function (request, response) {
	var oldMail = request.body.old_email;
	var newEmail = request.body.new_email;
	var newPass = request.body.new_password;
	console.log(oldMail + " - " + newEmail + " - " + newPass);
	var criteria = {"nombre":oldMail};
	var changes = {"nombre":newEmail};
	if(newPass != ""){
		changes["password"] = encrypt(newPass);
	}
	console.log(criteria);
	console.log(changes);
	persistencia.updateOn("usuarios",criteria,{$set: changes},{},function(err,result){
		if(err){
			console.log(err)
		} else {
		juego.modificarUsuario(oldMail,newEmail);
		response.send(result.result);
		}
	});
});

app.delete("/eliminarUsuario/", function (request, response) {
	var email = request.body.email;
	var pass = encrypt(request.body.password);
	console.log(email + " - " + pass)
	var criteria = {"nombre":email, "password":pass};
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
	persistencia.removeOn("usuarios",{},function(){})
	persistencia.removeOn("resultados",{},function(){})
	persistencia.removeOn("limbo",{},function(){})
	response.send({"ok":"Todo bien"});
});

app.get('/nivelCompletado/:id/:tiempo', function (request, response) {
	console.log("NIVEL COMPLETADO");
	var id = request.params.id;
	var tiempo = parseInt(request.params.tiempo);
	var usuario = juego.buscarUsuarioById(id);
	if(usuario != undefined){
		console.log("Usuario encontrado en nivel completado")
		usuario.agregarResultado(new modelo.Resultado(usuario.nivel,tiempo));
		console.log(id + " - Tiempo " + tiempo + " IdJuego - " + usuario.idJuego);
		console.log(usuario.nivel);
		usuario.tiempo = tiempo;
	} else {
		console.log("Usuario NO encontrado en nivel completado")
		usuario = new modelo.Usuario("dummy");
	}
	usuario.nivel += 1;
	var set = {};
  	set["resultados.$.nivel" + (usuario.nivel-1)] = tiempo;
	persistencia.updateOn(
		"resultados",
		{
			usuario:ObjectID(id),
			"resultados.idJuego":usuario.idJuego
		},
		{$set : set},
		{upsert:false, multi:false},
		function(err,result){
			if(err){
				console.log(err);
			} 
		});
	console.log("Nuevo nivel es ->" + usuario.nivel);
	response.send({'nivel':usuario.nivel});
});

app.get('/obtenerResultados/:id', function (request, response) {
	var id = request.params.id;
	var user = juego.buscarUsuarioById(id);
	if(user == undefined){
		user = new modelo.Usuario("dummyRes");
		user.resultados.push(1);
	}
	response.send(user.resultados);
});

console.log("Servidor escuchando en el puerto "+process.env.PORT );
app.listen(process.env.PORT || port);

app.post('/meterEnLimbo/', function(request, response){
	var email = request.body.email;
	var pass = request.body.password;
	var time = (new Date()).valueOf();
	console.log(pass)
	function callbackInsertLimbo(err,data){
		if(err){
			console.log(err)
			response.send({result:err})
		} else {
			response.send({result:"insertOnLimbo", tiempo:time})
		}
	}
	persistencia.insertOn("limbo",{email:email,password:encrypt(pass),tiempo:time}, callbackInsertLimbo)
});

app.post('/meterEnUsuarios/', function(request, response){
	var email = request.body.email;
	var pass = request.body.password;
	var user = new modelo.Usuario(email);
	console.log(pass)
	persistencia.insertUser(user,encrypt(pass))
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
		console.log("Results en checkCursor")
		console.log(result)
		if(result.length == 0){
			self.emptyCursorCallback(result);
		} else {
			self.cursorWithSomethingCallback(result);
		}
	}
}