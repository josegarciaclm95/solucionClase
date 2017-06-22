var fs=require("fs");
var _ = require("underscore");

var persistencia = require("./persistencia.js");

function Juego(){
    this.nombre = "Aprende Jugando";
    this.niveles = [];
    this.usuarios = [];
    this.gestorPartidas = new Caretaker();
    var self = this;
    this.agregarNivel = function(nivel){
        this.niveles.push(nivel);
    };
    this.connectMongo = function(){
        persistencia.mongoConnect(self);
    }
    this.newUsuario = function(user_name, email, pass, time_register, activo, id){
        var newUser = new Usuario(user_name, email, pass, time_register, activo);
        newUser.maxNivel = this.niveles.length;
        newUser.id = id;
        self.usuarios.push(newUser);
        self.addRegistro(newUser.id);
        return newUser;
    }
    /**
     * Creación de usuario. Se instancia un usuario y se anade en el modelo y en mongo.
     * @param  {} user_name - nombre de usuario 
     * @param  {} email - email del usuario. Usado para la confirmacion. 
     * @param  {} pass - contrasena cifrada
     * @param  {} time_register - tiempo de registro. Usado para la confirmacion. 
     * @param  {} activo - flag indicando si el usuario está activo 
     * @param  {} response - objecto response asociado a la request
     */
    this.agregarUsuario = function(user_name,email,pass,time_register,activo, response){
        var a = this.buscarUsuario(email);
        if(a == undefined){
            console.log("\t Model -> \t Agregado nuevo usuario al modelo");
            var accept_affective = {
                affectiva: true,
                beyond: true,
                keys: true
            }; 
            persistencia.insertarUsuario(user_name,email,pass,time_register,activo, accept_affective, response, self);
        } else {
            console.log("\t Model -> \t El usuario ya existia. Se refrescan datos");
        }
    };
    
    /**
     * Comprobamos que el usuario de mail email esta a la espera de ser confirmado.
     * @param  {} email - email del usuario
     * @param  {} time_register - id unico generado al registrarse
     */
    this.confirmarUsuario = function (email, time_register) {
        var a = this.buscarUsuario(email);
        console.log(a);
        if (a == undefined) {
            return false;
        } else if (!a.activo && a.time_register == time_register) {
            a.activo = true;
            var criteria = {email:email,id_registro:time_register,activo:false};
            persistencia.updateOn("usuarios", criteria, { $set: { activo: true } }, {}, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("\t\t Persistencia -> Usuario activado");
                }
            });
            return true;
        } else {
            return false;
        }
    }

    /** 
     * Comprobación de que el usuario existe, tiene el nombre y email correspondiente, esta activo y su contrasena 
     * es correcto
     * @param  {} email_name
     * @param  {} password
     */
    this.comprobarUsuario = function(email_name, password){
        console.log("\t Model -> \t Comprobando usuario");
        var usuario = this.buscarUsuario(email_name);
        if(usuario == undefined) {
            console.log("\t El usuario no se encuentra")
            return undefined;
        } else if ((usuario.activo) && ((usuario.password == password) || (password == undefined))){
           console.log("\t Usuario encontrado y correcto")
           this.addRegistro(usuario.id);
            return usuario;
        } else {
            console.log("\t Usuario inactivo o con contrasena incorrecta")
           return undefined;
        }
    }
    this.addRegistro = function(id){
        this.gestorPartidas.addRegistro(id);
    }
    this.addPartida = function(usuario){
        this.gestorPartidas.addPartida(usuario);
    }
    this.guardarPartida = function(usuario, tiempo, vidas, affectiva_data, response){
        this.gestorPartidas.addResultados(usuario, tiempo, vidas, affectiva_data, response);
    };
    this.getPartida = function(usuario){
        return this.gestorPartidas.getPartida(usuario.id, usuario.id_partida_actual);
    };
    this.buscarUsuario = function(nombre_us){
        return this.usuarios.filter(function(actual_element){
            return (actual_element.email == nombre_us) || (actual_element.user_name == nombre_us);
        })[0];
    }
    this.buscarUsuarioById = function(id){
        return _.find(this.usuarios,function(usu){
			return usu.id == id
		});
    }
    this.eliminarUsuario = function(email, pass, response){
        console.log("\t\t Model -> \t Numero de usuarios " + this.usuarios.length);
        var index = this.usuarios.findIndex(function(actual_element){
            return (actual_element.email == email) || (actual_element.user_name == email);
        });
        if(index != -1){
            var criteria = {"email":email, "password":pass};
            var id = this.usuarios[index].id;
            this.usuarios.splice(index,1);
            persistencia.removeOn("usuarios",criteria,function(err,result){
		        if(err){
			        console.log(err)
		        } else {
			        console.log("Usuario eliminado")
			        response.send(result.result);
		        }
	        });	
            this.gestorPartidas.deletePartidas(id);
            console.log("\t\t Model -> \t Usuario eliminado. Numero de usuarios " + this.usuarios.length);
        } else {
            response.send({"ok":-1, "n":-1});
        }
    }
    this.modificarUsuario = function (newUserName, oldMail, newEmail, newPass, response) {
        var criteria = { "email": oldMail };
        var changes = {};
        var user = this.buscarUsuario(oldMail);
        if (user != undefined) {
            if (newEmail != "") {
                user.email = newEmail;
                changes["email"] = newEmail;
            }
            if (newUserName != "") {
                user.user_name = newUserName;
                changes["user_name"] = newUserName;
            }
            if (newPass != "") {
                user.password = newPass;
                changes["password"] = newPass;
            }
            persistencia.updateOn("usuarios", criteria, { $set: changes }, {}, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("\t Modificar usuario -> Datos actualizados");
                    response.send(result.result);
                }
            });
        } else {
            response.send({"ok":-1, "nModified":-1});
        }
    }
    this.actualizarPermisosUsuario = function(id, accept_affective, response){
        var changes = {"accept_affective" : accept_affective}
        var criteria = {}
        var user = this.buscarUsuarioById(id);
        if(user){
            console.log(user);
            user.accept_affective = accept_affective;
            criteria = {"email": user.email};
            persistencia.updateOn("usuarios", criteria, { $set: changes}, {}, function(err, result){
                if(err){
                    console.log(err);
                    response.send({"ok":-1})
                } else {
                    response.send({"ok":1});
                }
            });
        } else {
            response.send({});
        }
    }
    this.getResultados = function(response) {
        var results = []
        for(var i in this.usuarios){
            results.push({usuario:{user_name:this.usuarios[i].user_name, email: this.usuarios[i].email}, resultados: this.gestorPartidas.getPartidas(this.usuarios[i].id).partidas})
        }
        response.send(results);
    }
    Juego.prototype.toString = function(){
        var res = "Usuarios\n";
        this.usuarios.forEach(function(el){
            res += "Usuario " + el.email + " - Id " + el.id + "\n";
        });
        res += "Niveles\n";
        this.niveles.forEach(function(el){
            res += "Nivel " + el.nivel + " - Coordenadas " + el.platforms + "\n";
        });
        return res;
    }
    /**
     * Función auxiliar para la realización de pruebas. Se insertan usuarios en el modelo y en persistencia, 
     * incluyendo las inserciones pertinentes en la coleccion partidas
     * @param  {} user_name
     * @param  {} email
     * @param  {} pass
     * @param  {} time_register
     * @param  {} act
     * @param  {} response
     */
    this.insertarUsuarioPRUEBAS = function(user_name,email,pass,time_register,act,response){
        var accept_affective = {
            affectiva: true,
            beyond: true,
            keys: true
        };
        persistencia.insertarUsuario(user_name,email,pass,time_register,act, accept_affective, response, self)
    }

    this.limpiarMongoPRUEBAS = function(response){
        persistencia.removeOn("usuarios",{},function(){
		    persistencia.removeOn("resultados",{},function(){
			    persistencia.removeOn("limbo",{},function(){
				    persistencia.removeOn("partidas",{},function(){
                    response.send({"ok":"Todo bien"});
                })
			});
		});
	});	
    }

    this.adaptarPartida = function(id, partidas){
        for(var i in partidas){
            this.gestorPartidas.adaptarPartida(id, partidas[i]);
        }
    }
}
    
function Nivel(num, recipe, platforms){
    this.nivel = parseInt(num.slice(5)); //num es una cadena tipo "nivelX", siendo X (empieza en quinto caracter) el numero del nivel
    this.recipe = new Recipe(recipe.name, recipe.recipe_info, recipe.ingredients, recipe.sentences);
    this.platforms = platforms;
}

function Recipe(name, recipe_info, ingredients, sentences){
    this.name = name;
    this.recipe_info = recipe_info;
    this.ingredients = ingredients;
    this.sentences = sentences;
}

function Usuario(user_name, email, pass, time_register, activo){
    this.user_name = user_name;
    this.email = email;
    this.password = pass;
    this.id_partida_actual = "";
    this.nivel = 1;
    this.time_register = time_register;
    this.activo = activo;
    this.accept_affective = {
        affectiva: true,
        beyond: true,
        keys: true
    }
    Usuario.prototype.toString = function(){
        var r = "Usuario " + user_name + " con email " +  this.email + " - Id " + this.id + "\n";
        r += "Registrado con id  " + this.time_register + + " y activo = " + this.activo +  "\n";
        return r;
    }
}

function Partida(){
    this.id_partida = (new Date()).valueOf();
    this.resultados = [];
    this.agregarResultado = function(nivel, tiempo, vidas, affectiva_data){
        this.resultados.push(new Resultado(nivel, tiempo, vidas, affectiva_data));
    }
    Partida.prototype.toString = function(){
        var r = "Partida " + this.id_partida + "\n";
        r += "\t\t Resultados\n";
        for(var i in this.resultados){
            r += "\t\t\t" + this.resultados[i].toString() + "\n";
        } 
        return r;
    }
}

//partidas [{id_usuario:id, partidas:[Partida()]}]
/**
 * Gestor de los mementos (partidas)
 */
function Caretaker(){
    this.partidas = [];
    /**
     * Se anade un registro al conjunto de partidas de usuario si no existia
     * @param id
     */
    this.addRegistro = function(id){
        if(!(parts = this.getPartidas(id))){
            this.partidas.push({id_usuario:id, partidas:[]})
            console.log("\t\t Model -> \t Registro anadido en caretaker");
        }
    }
    this.getPartidas = function(id){
        return this.partidas.filter(function(actual_element){
            return actual_element.id_usuario == id;
        })[0];
    } 
    this.getPartida = function(id_usuario, id_partida){
        if(parts = this.getPartidas(id_usuario)){
            return parts.partidas.filter(function(actual_element){
                return actual_element.id_partida == id_partida;
            })[0];
        } else {
            console.log("\t\t Model -> \t GetPartida no ha encontrado nada")
            //console.log(parts);              
        }
    }
    /**
     * Se busca en la colección partidas en base al id de usuario y se anade la Partida a su array de Partidas
     * @param id - id de usuario.
     */
    this.addPartida = function(usuario){
        var newPartida = new Partida();
        usuario.id_partida_actual = newPartida.id_partida;
        if(part = this.getPartidas(usuario.id)){
            part.partidas.push(newPartida)
            console.log("\t\t Model -> \t Partida added");
        } else {
            console.log("\t\t Model -> \t No existe el registro");
            //console.log(this)
        }
    }
    /**
     * A la partida actual que esta jugando usuario se añaden los resultados que corresponden a su nivel actual
     * @param usuario - usuario.
     * @param tiempo - tiempo en acabar el nivel.
     * @param vidas - vidas al acabar el nivel.
     */
    this.addResultados = function(usuario, tiempo, vidas, affectiva_data, response){
        if(partida = this.getPartida(usuario.id, usuario.id_partida_actual)){
            console.log("\t\t Model -> \t\t\t AddPartida - Partida encontrada");
            partida.agregarResultado(usuario.nivel,tiempo,vidas, affectiva_data);
            persistencia.addNuevoResultado(usuario, tiempo, vidas, affectiva_data, response);
        }
    }
    this.deletePartidas = function(id){
        var index = this.partidas.findIndex(function(actual_element){
            return actual_element.id_usuario == id;
        });
        if(index != -1){
            this.partidas.splice(index,1);
            console.log("\t\t Model -> \t Registro eliminado en Caretaker");
        }
    }
    Caretaker.prototype.toString = function(){
        var r = "Caretaker \n";
        r += "\t Mementos \n";
        for(var i in this.partidas){
            r += "\t\t" + this.partidas[i].id_usuario + "\n";
            for(var j in this.partidas[i].partidas){
                r += "\t\t\t" + this.partidas[i].partidas[j].toString();
            }
        } 
        return r;
    }
    /**
     * Funcion auxiliar para recuperar los datos de Mongo y convertirlos a datos del modelo
     * @param  {} id
     * @param  {} partida Registro de mongo con los datos de una partida
     */
    this.adaptarPartida = function(id, partida){
        //console.log(partida)
        if(result = this.getPartida(id, partida.id_partida)){
            console.log(partida.affectiva_data);
            result.agregarResultado(partida.nivel,partida.tiempo,partida.vidas, partida.affectiva_data);
        } else {
            var p = new Partida();
            p.id_partida = partida.id_partida;
            p.agregarResultado(partida.nivel, partida.tiempo, partida.vidas, partida.affectiva_data);
            this.getPartidas(id).partidas.push(p);
        }
        console.log("\t Model -> \t Resultados de mongo insertados en Modelo");
    }
}

function Resultado(nivel,tiempo,vidas, affectiva_data){
    this.nivel = nivel;
    this.tiempo = tiempo;
    this.vidas = vidas;
    this.affectiva_data = affectiva_data,
    Resultado.prototype.toString = function(){
        return "Nivel " + this.nivel + " - Tiempo " + this.tiempo + " - Vidas " + this.vidas; 
    }
}

function JuegoFM(archivo){
    this.juego = new Juego();
    this.array = leerCoordenadas(archivo);
    this.makeJuego = function(){
        var j = new Juego();
        for(var x in this.array){
            var nivel = new Nivel(x,this.array[x].recipe, this.array[x].platforms);
            j.agregarNivel(nivel);
        }
        return j;
    }
}

function leerCoordenadas(archivo){
    var array = JSON.parse(fs.readFileSync(archivo));
    return array;
}


module.exports.Juego = Juego;
module.exports.Usuario = Usuario;
module.exports.Nivel = Nivel;
module.exports.JuegoFM = JuegoFM;
module.exports.Resultado = Resultado;