var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var host = config.host;
var port = config.port;
var emailUser = config.emailUser;
var emailPass = config.emailPass;
var exp = require("express");
var modelo = require("./servidor/modelo.js");
var app = exp();
var juegofm = new modelo.JuegoFM('./cliente/js/juego-json.json');
var juego = juegofm.makeJuego();
//console.log(juego.toString());
var MongoClient = require('mongodb');
var ObjectID = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var urlM = 'mongodb://josemaria:procesos1617@ds031617.mlab.com:31617/usuariosjuego';
var dbM;
var usersM;
var resultsM;

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

var html = '¡¡Bienvenido a ConquistaNiveles!! <br/>';
html += 'Confirme su cuenta haciendo clic en el siguiente enlace: <br/>';

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
				addNewResults(u);
				juego.agregarUsuario(u);
				console.log("Usuario " + u.nombre + " agregado en Login");
				//console.log(u);
				response.send(u);
			}
			cursor.toArray(cursorHandler.checkCursor);
		}
	}
	findSomething("usuarios",criteria,callbackLogin);
});

app.post("/crearUsuario/", function (request, response) {
	var email = request.body.email;
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
									insertOn("limbo",{email:email,password:encrypt(pass),tiempo:time},function(err,data){
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
				findSomething("limbo",criteria,callbackCrearUsuarioLimbo)
			}
			cursor.toArray(cursorHandler.checkCursor)
		}
	}
	findSomething("usuarios",criteria,callbackCrearUsuario)
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
				insertUser(usuario,users[0].password);
				dbM.collection("limbo").remove({email:email});
				response.redirect("/");
			}
			cursor.toArray(cursorHandler.checkCursor);
		}
	}
	findSomething("limbo",criteria,callbackConfirmar)
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
	usersM.update(criteria,{$set: changes}, {},function(err,result){
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
	usersM.remove(criteria,function(err,result){
		if(err){
			console.log(err)
		} else {
			console.log("Usuario eliminado")
			juego.eliminarUsuario(email);
			response.send(result.result);
		}
	})	
});

app.get("/resultados/", function (request, response) {
	dbM.collection("usuarios").find({}).toArray(function(err,data){
		callBackUsuarios(err,data,response);
	});
});	

function callBackUsuarios(err,data,response){
	var res = [];
	if(err){
		console.log(err);
	} else {
		console.log(data.length);
		if(data.length != 0){
			var max = data.length;
			data.forEach(function(item,i){
				var user = {}
				user.nombre = item.nombre;
				dbM.collection("resultados").find({usuario:ObjectID(item._id)}).toArray(function(err,results){
					//console.log("Llamada con i = " + i)
					callBackResultados(err,results,user,res,response,i,max);				
				});
			});
		} else {
			response.send({});
		}
	}
}

function callBackResultados(err,results,user,res,response,i,max){
	if(err){
		console.log(err);
	} else {
		user.resultados = results[0].resultados;
		res.push(user);
		if(i + 1 == max){
			response.send(res);
		}
	}
}

app.get('/limpiarMongo/', function(request,response){
	usersM.remove({});
	dbM.collection("resultados").remove({});
	response.send({"ok":"Todo bien"});
});

app.get('/nivelCompletado/:id/:tiempo', function (request, response) {
	console.log("NIVEL COMPLETADO");
	var id = request.params.id;
	var tiempo = parseInt(request.params.tiempo);
	var usuario = juego.buscarUsuarioById(id);
	if(usuario != undefined){
		usuario.agregarResultado(new modelo.Resultado(usuario.nivel,tiempo));
		console.log(id + " - Tiempo " + tiempo + " IdJuego - " + usuario.idJuego);
		console.log(usuario.nivel);
		usuario.tiempo = tiempo;
	} else {
		usuario = new modelo.Usuario("dummy");
		
	}
	usuario.nivel += 1;
	var set = {};
  	set["resultados.$.nivel" + (usuario.nivel-1)] = tiempo;
	dbM.collection("resultados").update(
		{usuario:ObjectID(id),
		"resultados.idJuego":usuario.idJuego
		},
		{$set : set},
		{upsert:false, multi:false},
		function(err,result){
			if(err){
				console.log(err);
			} 
			//console.log(result);
		}
	);
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

function mongoConnect(){
	MongoClient.connect(urlM, function (err, db) {
		if(err){
			console.log(err);
		} else {
			console.log("Conectados");
			dbM = db;
			usersM = dbM.collection("usuarios");
		}
	});
}

mongoConnect();

function addNewResults(usuario){
	dbM.collection("resultados").update(
		{usuario:usuario.id},
		{$push: {resultados: {idJuego:usuario.idJuego,nivel1:-1,nivel2:-1,nivel3:-1,nivel4:-1}}}
	);
}

function insertUser(usuario,pass){
	usersM.insert({id_juego:usuario.idJuego, nombre:usuario.nombre, password:pass, nivel:usuario.nivel, vidas:usuario.vidas}, function(err,result){
		if(err){
			console.log(err);
		} else {
			usuario.id = result.ops[0]._id;
			usuario.maxNivel = juego.niveles.length;
			console.log("Id asignado a insertUser - " + usuario.id);
			juego.agregarUsuario(usuario);
			var obj = {usuario:usuario.id, 
						resultados:[
								{idJuego:usuario.idJuego,nivel1:-1,nivel2:-1,nivel3:-1, nivel4:-1}
							]
					}
			function consoleLogError(err,result){
				if(err){
					console.log(err);
				} else {
					console.log("Resultados inicializados en insertUser")
				}
			}
			insertOn("resultados",obj, consoleLogError);
			console.log("Usuario " + usuario.nombre + " insertado");
		}
	});
}


function findSomething(collection,criteria,callback){
	dbM.collection(collection).find(criteria,callback);
}

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
	insertOn("limbo",{email:email,password:encrypt(pass),tiempo:time}, callbackInsertLimbo)
});

app.post('/meterEnUsuarios/', function(request, response){
	var email = request.body.email;
	var pass = request.body.password;
	var user = new modelo.Usuario(email);
	console.log(pass)
	insertUser(user,encrypt(pass))
});

function insertOn(collection,object,callback){
	dbM.collection(collection).insert(object,callback);
}

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