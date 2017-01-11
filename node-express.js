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

app.post('/login/', function(request, response){
	console.log("Login")
	var email = request.body.email;
	var password = request.body.password;
	var criteria = {"email":email, activo:true};
	if (password != undefined){
		criteria["password"] = encrypt(password);
	}
	function callbackLogin(err,cursor){
		if(err){
			console.log(err)
		} else {
			var cursorHandler = new CursorHandler();
			cursorHandler.emptyCursorCallback = function(users){
				console.log("\t Login -> \t No existe el usuario " + email + " o esta sin activar. Login fallido");
				response.send({nivel:-1});
			} 
			cursorHandler.cursorWithSomethingCallback = function(users){
				var u = new modelo.Usuario(users[0].email);
				console.log("\t Login -> \t Usuario " + u.email + " existe");
				u.id = users[0]._id;
				u.maxNivel = juego.niveles.length;
				//persistencia.addNewResults(u);
				juego.agregarUsuario(u);
				response.send(u);
			}
			cursor.toArray(cursorHandler.checkCursor);
		}
	}
	persistencia.findSomething("usuarios",criteria,callbackLogin);
});

app.post("/crearUsuario/", function (request, response) {
	console.log("Crear usuarios")
	var email = request.body.email;
	var pass = request.body.password;
	var urlD = request.body.url;
	var criteria = {"email":email};
	function callbackCrearUsuario(err,cursor){
		if(err){
			console.log(err);
		} else {
			var cursorHandler = new CursorHandler();
			cursorHandler.cursorWithSomethingCallback = function(users){
				console.log("\t Crear Usuario -> \t El usuario ya existe");
				response.send({result:"userExists"})
			}
			cursorHandler.emptyCursorCallback = function(users){
				var time_register = (new Date().valueOf());
				console.log("\t Crear Usuario -> \t No se ha encontrado el usuario");
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
						console.log('Message sent: ' + info.response);
						persistencia.insertOn("usuarios",{email:email,password:encrypt(pass),id_registro:time_register,activo:false},function(err,data){
							if(err){
								console.log(err)
							} else {
								console.log("\t Crear Usuario -> \t Usuario added a usuarios");
								response.send({result:"confirmEmail"})
							}
						});
					}
				}
				client.sendMail(mensaje, callbackSendEmail);
			}
			cursor.toArray(cursorHandler.checkCursor)
		}
	}
	persistencia.findSomething("usuarios",criteria,callbackCrearUsuario)
});

app.get("/confirmarCuenta/:email/:id", function (request, response) {
	console.log("Confirmar cuenta")
	var email = request.params.email;
	var id = parseInt(request.params.id);
	var criteria = {email:email,id_registro:id,activo:false};
	function callbackConfirmar(err,cursor){
		if(err){
			console.log(err);
		} else {
			var cursorHandler = new CursorHandler();
			cursorHandler.emptyCursorCallback = function(users) {
				console.log("\t Confirmar cuenta -> \t El usuario ya se ha confirmado o no se ha registrado");
				response.redirect("/");
			}
			cursorHandler.cursorWithSomethingCallback = function(users){
				console.log("\t Confirmar cuenta -> \t Encontrado usuario en Limbo");
				var usuario = new modelo.Usuario(email,users[0].password,juego,undefined);
				//persistencia.insertUser(usuario,users[0].password,juego,undefined);
				persistencia.updateOn("usuarios",criteria,{$set: {activo:true}},{},function(err,result){
					if(err){
						console.log(err)
					} else {
						console.log("\t Confirmar cuenta -> Usuario activado");
					}	
				});
				//persistencia.removeOn("limbo",{email:email},function(){})
				response.redirect("/");
			}
			cursor.toArray(cursorHandler.checkCursor);
		}
	}
	persistencia.findSomething("usuarios",criteria,callbackConfirmar)
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
	persistencia.removeOn("usuarios",{},function(){
		persistencia.removeOn("resultados",{},function(){
			persistencia.removeOn("limbo",{},function(){
				juego = juegofm.makeJuego();
				response.send({"ok":"Todo bien"});
			});
		});
	});	
});

app.get('/nivelCompletado/:id/:tiempo', function (request, response) {
	console.log("Nivel completado");
	var id = request.params.id;
	var tiempo = parseInt(request.params.tiempo);
	var usuario = juego.buscarUsuarioById(id);
	if(usuario != undefined){
		console.log("\t Nivel completado -> \t Usuario encontrado en nivel completado")
		usuario.agregarResultado(new modelo.Resultado(usuario.nivel,tiempo));
		console.log("\t Nivel completado -> \t Usuario " + id + " - Tiempo " + tiempo + "-  IdJuego - " + usuario.idJuego);
		usuario.tiempo = tiempo;
	} else {
		console.log("\t Nivel completado -> \t Usuario NO encontrado en nivel completado")
		usuario = new modelo.Usuario("dummy");
		usuario.nivel = -2;
	}
	var nivel = usuario.nivel;
	usuario.nivel += 1;
	if(usuario.nivel > juego.niveles.length){
		usuario.nivel = 1;
	}
	var set = {};
  	set["resultados.$.nivel" + nivel] = tiempo;
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
	console.log("\t Nivel completado -> \tNuevo nivel es ->" + usuario.nivel);
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

app.post('/meterEnUsuarios/', function(request, response){
	var email = request.body.email;
	var pass = request.body.password;
	var user = new modelo.Usuario(email);
	var time = (new Date()).valueOf();
	var act = JSON.parse(request.body.activo);
	//console.log(pass)
	
	function callbackInsertUsuarios(err,data){
		//console.log(data);
		if(err){
			console.log(err)
			response.send({result:err})
		} else {
			console.log("Usuario " + email + " con pass " + pass + " -  tiempo de registro " + time + " y activo " + act + " insertado")
			response.send({result:"insertOnUsuarios", tiempo:time, id:data.ops[0]._id, maxNivel: juego.niveles.length});
			//
		}
	}
	persistencia.insertOn("usuarios",{email:email,password:encrypt(pass),id_registro:time, activo:act}, callbackInsertUsuarios)
	//persistencia.insertUser(user,encrypt(pass),juego,response);
	//response.send({result:request.body});
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