/**********************************************************************
 * "/" - Se responde con el index
 * "/crearUsuario/nombre" - Crea el usuario y devuelve el juego junto con sus datos. Dentro de agregarUsuario() se crea
 * su registro en el fichero juego.json, con miras a ahorrar comprobaciones cuando se guarde su score
 * "/resultados/" - Lee el contenido de juego.json
 *
 * *
 *
 **********************************************************************/
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


//app.use(app.router);
app.use(exp.static(__dirname + "/cliente/"));
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get("/mierdaPrueba/", function (request, response) {
	//var jsa = JSON.parse(fs.readFileSync("./cliente/js/juego-json.json"));
	//response.send(jsa);
	dbM.collection("resultados").update(
		{usuario:"5818be9c74aaec1824c28626","resultados.idJuego":1478016668428},
		{$set: {"resultados.$.nivel1":"20"}}
	);
});

app.get("/datosJuego/:id", function (request, response) {
	//console.log("Llamada a /datosJuego/" + request.params.nivel);
	var id = request.params.id;
	var usuario = juego.buscarUsuarioById(id);
	var res;
	console.log("LLamada a datosJuego, id - " + id);
	console.log("Usuario encontrado ");
	console.log(usuario);
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
	usersM.find(criteria, function(err,cursor){
		if(err){
			console.log(err);
		} else {
			cursor.toArray(function(er, users){
				if(users.length == 0){
					console.log("No existe el usuario (crearUsuario)");
					var criteria = {"email":email};
					dbM.collection("limbo").find(criteria,function(err,cursor){
						if(err){
							console.log(err);
						} else {
							cursor.toArray(function(er, limbos){
								if(limbos.length == 0){
									var time = (new Date().valueOf());
									//console.log(window.location.href)
									var url = urlD + "/confirmarCuenta/" + email + "/" + time;
									console.log(time);
									var html = 'Confirme su cuenta haciendo clic en el siguiente enlace: <br/>';
									html += '<a href='+url+'>'+url+'</a>';
									var mensaje = {
										from: 'donotanswer@juegoprocesos.com',
										to: email,
										subject: 'Confirme su cuenta',
										text: 'Hello world',
										html: html
									};
									client.sendMail(mensaje, function(errr, info){
										if (errr){
											console.log(errr);
											response.send({result:"EmailNotSent"})
										}
										else {
											console.log('Message sent: ' + info.response);
											dbM.collection("limbo").insert({email:email,password:encrypt(pass),tiempo:time},function(err,data){
												if(err){
													console.log(err)
												} else {
													response.send({result:"confirmEmail"})
												}
											})
										}
									});
									//response.send({result:"confirmEmail"})
								} else {
									console.log("El usuario ya existe en limbo(crearUsuario)");
									response.send({result:"userExists"})
								}
							})
						}
						});
					//var usuario = new modelo.Usuario(email);
					//juego.agregarUsuario(usuario);
					//result = insertUser(usuario,pass);
					
					//usuario.maxNivel = juego.niveles.length;
				} else {
					console.log("El usuario ya existe en usuarios(crearUsuario)");
					response.send({result:"userExists"})
					//response.send({nivel:-1});
				}
			});
		}
	});
});

app.get("/confirmarCuenta/:email/:id", function (request, response) {
	console.log("CONFIRMAMOS CUENTA!!!")
	var email = request.params.email;
	console.log("EMAIL !!!" + email)
	var id = parseInt(request.params.id);
	console.log("TIEMPO !!!" + id)
	var criteria = {email:email,tiempo:id};
	dbM.collection("limbo").find(criteria, function(err,cursor){
		if(err){
			console.log(err);
		} else {
			cursor.toArray(function(er, users){
				console.log("USERS!!")
				console.log(users)
				if(users.length != 0){
					console.log("USERS ES DISTINTO DE CERO!!")
					console.log(users)
					console.log("Confirmar - Existe el usuario");
					var usuario = new modelo.Usuario(email);
					insertUser(usuario,users[0].password);
					dbM.collection("limbo").remove({email:email});
				} else {
					console.log("El usuario ya existe");
				}
				response.redirect("/");
			});
		}
	});
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
	var criteria = {"nombre":email, "password":pass};
	usersM.remove(criteria,function(err,result){
		if(err){
			console.log(err)
		} else {
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
					console.log("Llamada con i = " + i)
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
		console.log(results)
		console.log(results[0].resultados);
		user.resultados = results[0].resultados;
		//console.log(user);
		res.push(user);
		console.log(i + " -  max " + max);
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
	usuario.agregarResultado(new modelo.Resultado(usuario.nivel,tiempo));
	console.log(id + " - Tiempo " + tiempo + " IdJuego - " + usuario.idJuego);
	usuario.nivel += 1;
	console.log(usuario.nivel);
	usuario.tiempo = tiempo;
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
	response.send(user.resultados);
});


console.log("Servidor escuchando en el puerto "+process.env.PORT );
app.listen(process.env.PORT || port);
//console.log("Servidor escuchando en el puerto " + port);
//app.listen(port, host);

function mongoConnect(){
	MongoClient.connect(urlM, function (err, db) {
		if(err){
			console.log(err);
		} else {
			console.log("Conectados");
			dbM = db;
			usersM = dbM.collection("usuarios");
			//console.log(usersM);
			//console.log("Datos extraidos");
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
			dbM.collection("resultados").insert({usuario:usuario.id, resultados:[{idJuego:usuario.idJuego,nivel1:-1,nivel2:-1,nivel3:-1}]},function(err1,result1){
				if(err1){
					console.log(err1);
				} else {
					console.log("Resultados inicializados");
					//console.log(result1);
				}
			});
			console.log("Usuario insertado");
			return result;
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
	insertUser(user,pass)
});





function insertOn(collection,object,callback){
	dbM.collection(collection).insert(object,callback);
}

//Añadir el usuario a limbo
//Mandar email
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

var cursorHandler = new CursorHandler();	
