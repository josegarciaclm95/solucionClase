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
			console.log("Agregado registro de resultados")
		}
	);
}

module.exports.findSomething = function (collection,criteria,callback){
	dbM.collection(collection).find(criteria,callback);
}

module.exports.insertOn = function(collection,object,callback){
	dbM.collection(collection).insert(object,callback);
}

module.exports.removeOn = function(collection,criteria,callback){
    dbM.collection(collection).remove(criteria,callback);
}

module.exports.updateOn = function(collection,criteria,changes,options,callback){
    dbM.collection(collection).update(criteria,changes,options,callback)
}

module.exports.insertUser = function(usuario,pass){
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

module.exports.getResultados = function(response){
    dbM.collection("usuarios").find({}).toArray(function(err,data){
		callBackUsuarios(err,data,response);
	});
}

function callBackUsuarios(err,data,response){
	var res = [];
	if(err){
		console.log(err);
	} else {
		console.log("Callback de usuarios en persistencia");
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

