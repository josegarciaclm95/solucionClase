var MongoClient = require('mongodb');
var ObjectID = require("mongodb").ObjectID;
var urlM = 'mongodb://josemaria:procesos1617@ds031617.mlab.com:31617/usuariosjuego';
var dbM;
var usersM;
var resultsM;

module.exports.mongoConnect = function(){
	MongoClient.connect(urlM, function (err, db) {
		if(err){
			console.log(err);
		} else {
			console.log("Conectados en persistencia");
			dbM = db;
			usersM = dbM.collection("usuarios");
		}
	});
}

module.exports.addNewResults = function (usuario){
	dbM.collection("resultados").update(
		{usuario:usuario.id},
		{$push: {resultados: {idJuego:usuario.idJuego,nivel1:-1,nivel2:-1,nivel3:-1,nivel4:-1}}},
		function(){
			console.log("\t Agregado registro de resultados")
		}
	);
}

module.exports.findSomething = function (collection,criteria,callback){
	dbM.collection(collection).find(criteria,callback);
}

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

module.exports.insertarUsuario = function(newUser, gestorPartidas, response){
	usersM.insert({user_name: newUser.user_name, email:newUser.email, password: newUser.password, id_registro: newUser.time_register, activo:newUser.activo}, function(err, result){
		if(err){
			console.log(err);
		} else {
			newUser.id = result.ops[0]._id;
			console.log("\t Id de Mongo asignado a usuario insertado - " + newUser.id);
			function consoleLogError(err,result){
				if(err){
					console.log(err);
				} else {
					console.log("\t Datos de partifas inicializados en insertarUsuario")
					gestorPartidas.addRegistro(newUser.id);
					console.log(gestorPartidas);
					console.log(gestorPartidas.toString());
					if (response != undefined) response.send({result:"insertOnUsuarios",id:newUser.id,maxNivel:newUser.maxNivel});
				}
			}
			insertOn("partidas",{id_usuario:newUser.id, partidas:[]}, consoleLogError);
		}
	})
}
/*
module.exports.insertUser = function(usuario,pass,juego,response){
	usersM.insert({id_juego:usuario.idJuego, nombre:usuario.nombre, password:pass, nivel:usuario.nivel, vidas:usuario.vidas}, function(err,result){
		if(err){
			console.log(err);
		} else {
			usuario.id = result.ops[0]._id;
			usuario.maxNivel = juego.niveles.length;
			console.log("\t Id de Mongo asignado a usuario insertado - " + usuario.id);
			juego.agregarUsuario(usuario);
			var obj = {
				usuario:usuario.id, 
				resultados:[
						{idJuego:usuario.idJuego,nivel1:-1,nivel2:-1,nivel3:-1, nivel4:-1}
				]
			}
			function consoleLogError(err,result){
				if(err){
					console.log(err);
				} else {
					console.log("\t Resultados inicializados en insertUser")
					if (response != undefined) response.send({result:"insertOnUsuarios",id:usuario.id,maxNivel:usuario.maxNivel});
				}
			}
			insertOn("resultados",obj, consoleLogError);
			console.log("\t Usuario " + usuario.nombre + " insertado");
		}
	});
}*/

module.exports.getResultados = function(response){
	console.log("Resultados");
    dbM.collection("usuarios").find({}).toArray(function(err,data){
		callBackUsuarios(err,data,response);
	});
}

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
				user.nombre = item.nombre;
				dbM.collection("resultados").find({usuario:ObjectID(item._id)}).toArray(function(err,results){
					callBackResultados(err,results,user,res,response,i,max);				
				});
			});
		} else {
			response.send({});
		}
	}
}

function callBackResultados(err,results,user,res,response,i,max){
	console.log("\t\t Callback de usuarios en persistencia");
	if(err){
		console.log(err);
	} else if(results.length != 0) {
		user.resultados = results[0].resultados;
		res.push(user);
		if(i + 1 == max){
			response.send(res);
		}
	}
}