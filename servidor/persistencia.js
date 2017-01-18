var MongoClient = require('mongodb');
var ObjectID = require("mongodb").ObjectID;
var urlM = 'mongodb://josemaria:procesos1617@ds031617.mlab.com:31617/usuariosjuego';
var dbM;
var usersM;
var resultsM;

module.exports.mongoConnect = function(juego){
	console.log("Connect on Persistencia");
	MongoClient.connect(urlM, function (err, db) {
		if(err){
			console.log(err);
		} else {
			console.log("Conectados en persistencia");
			dbM = db;
			usersM = dbM.collection("usuarios");
			usersM.find().toArray(function(err, cursor){
				if(err){
					console.log(err)
				} else {
					cursor.forEach(function(actual){
						console.log("\tPersistencia -> \t Agregado nuevo usuario al modelo");
            			juego.newUsuario(actual.user_name, actual.email, actual.password, actual.time_register, actual.activo, actual._id)
						dbM.collection("partidas").find({id_usuario: ObjectID(actual._id)}).toArray(function(err, cursor){
							if(err){
								console.log(err);
							} else {
								cursor.forEach(function(partida){
									juego.adaptarPartida(actual._id, partida.partidas);
								});
							}
						});
				})
				}
			});
		}
	});
}

module.exports.addNuevoResultado = function(usuario, tiempo, vidas, response){
	dbM.collection("partidas").update(
		{id_usuario:usuario.id},
		{$push: {partidas:{id_partida:usuario.id_partida_actual, nivel:usuario.nivel, tiempo: tiempo, vidas: vidas}}},
		function(err, doc){
			if(err){
				console.log(err);
			} else {
				var nivel = usuario.nivel;
				usuario.nivel += 1;
				if (usuario.nivel > usuario.maxNivel) {
					usuario.nivel = 1;
				}
				response.send({'nivel':usuario.nivel});
				console.log("\t Agregado registro de resultados")
			}
		})
}

function findSomething(collection,criteria,callback){
	dbM.collection(collection).find(criteria,callback);
}
module.exports.findSomething = findSomething;

function insertOn(collection,object,callback){
	dbM.collection(collection).insert(object,callback);
}
module.exports.insertOn = insertOn;

module.exports.removeOn = function(collection,criteria,callback){
    dbM.collection(collection).remove(criteria,callback);
}

module.exports.updateOn = function(collection,criteria,changes,options,callback){
    dbM.collection(collection).update(criteria,changes,options,callback)
}

module.exports.insertarUsuario = function(user_name, email, pass, time_register, activo, response, juego){
	usersM.insert({user_name:user_name, email:email, password: pass, id_registro: time_register, activo:activo}, function(err, result){
		if(err){
			console.log(err);
		} else {
			var newUser = juego.newUsuario(user_name, email, pass, time_register, activo, result.ops[0]._id)
			console.log("\t Id de Mongo asignado a usuario insertado - " + newUser.id);
			function consoleLogError(err,result){
				if(err){
					console.log(err);
				} else {
					console.log("\t Datos de partidas inicializados en insertarUsuario")
					if (response != undefined) response.send({result:"insertOnUsuarios", tiempo:newUser.time_register, id:newUser.id,maxNivel:newUser.maxNivel});
				}
			}
			insertOn("partidas",{id_usuario:newUser.id, partidas:[]}, consoleLogError);
		}
	})
}

function getResultados (response){
	console.log("Persistencia -> Resultados");
	dbM.collection("usuarios").find({}).toArray(function(err,data){
		callBackUsuarios(err,data,response);
	});
}
module.exports.getResultados = getResultados;

function callBackUsuarios(err,data,response){
	console.log("\t Callback de usuarios en persistencia");
	var res = [];
	if(err){
		console.log(err);
	} else {
		if(data.length != 0){
			var max = data.length;
			data.forEach(function(item,i){
				var user = {}
				user.user_name = item.user_name;
				user.email = item.email;
				dbM.collection("partidas").find({id_usuario:ObjectID(item._id)}).toArray(function(err,results){
					callBackResultados(err,results,user,res,response,i,max);				
				});
			});
		} else {
			if(response != undefined) response.send({});
		}
	}
}

function callBackResultados(err,results,user,res,response,i,max){
	console.log("\t\t Callback de usuarios en persistencia");
	if(err){
		console.log(err);
	} else if(results.length != 0) {
		user.resultados = results[0].partidas;
		res.push(user);
		if(i + 1 == max){
			if(response != undefined) response.send(res);
		}
	}
}