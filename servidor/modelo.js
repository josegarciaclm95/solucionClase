var fs=require("fs");
var _ = require("underscore");
//var persistencia = require("./servidor/persistencia.js");
//persistencia.mongoConnect();

function Juego(){
    this.nombre = "Niveles";
    this.niveles = [];
    this.usuarios = [];
    this.gestorPartidas = new Caretaker();
    this.agregarNivel = function(nivel){
        this.niveles.push(nivel);
    };
    this.agregarUsuario = function(usuario,pass,juego,response){
        var a = this.buscarUsuario(usuario.email);
        if(a == undefined){
            console.log("\t\t Model -> \t Agregado nuevo usuario al modelo");
            this.usuarios.push(usuario);
            this.gestorPartidas.addRegistro(usuario.id);
        } else {
            console.log("\t\t Model -> \t El usuario ya existia. Se refrescan datos");
            a.nivel = 1;
            a.resultados = [];
            a.idJuego = usuario.idJuego
            this.gestorPartidas.addRegistro(a.id);
        }
        console.log(this.gestorPartidas.toString());
    };
    this.addPartida = function(usuario){
        this.gestorPartidas.addPartida(usuario);
        console.log(this.gestorPartidas.toString());
    }
    this.guardarPartida = function(usuario, tiempo, vidas){
        this.gestorPartidas.addResultados(usuario, tiempo, vidas);
        console.log(this.gestorPartidas.toString());
    };
    this.getPartida = function(usuario){
        console.log(this.gestorPartidas.toString());
        return this.gestorPartidas.getPartida(usuario.id, usuario.id_partida_actual);
    };
    this.buscarUsuario = function(nombre_us){
        return this.usuarios.filter(function(actual_element){
            return actual_element.email == nombre_us;
        })[0];
    }
    this.buscarUsuarioById = function(id){
        return _.find(this.usuarios,function(usu){
			return usu.id == id
		});
    }
    this.eliminarUsuario = function(nombre_us){
        console.log("\t\t Model -> \t Numero de usuarios " + this.usuarios.length);
        var index = this.usuarios.indexOf(this.buscarUsuario(nombre_us));
        this.usuarios.splice(index,1);
        console.log("\t\t Model -> \t Usuario eliminado. Numero de usuarios " + this.usuarios.length);
    }
    this.modificarUsuario = function(oldMail,newEmail, newPass){
        var user = this.buscarUsuario(oldMail);
        if (user != undefined){
            user.email = newEmail;
            if(newPass != ""){
                user.password = newPass;
            }
        }
    }
    Juego.prototype.toString = function(){
        var res = "Usuarios\n";
        this.usuarios.forEach(function(el){
            res += "Usuario " + el.email + " - Id " + el.idJuego + "\n";
        });
        res += "Niveles\n";
        this.niveles.forEach(function(el){
            res += "Nivel " + el.nivel + " - Coordenadas " + el.platforms + "\n";
        });
        return res;
    }
}
    
function Nivel(num,coord,gravedad,numEstrellas){
    this.nivel = parseInt(num[5]);
    this.platforms = coord;
    this.gravity = gravedad;
    this.starsNumber = numEstrellas;
}

function Usuario(email){
    this.email = email;
    this.password = "";
    this.vidas = 5;
    this.idJuego = new Date().valueOf();
    this.id_partida_actual = "";
    this.nivel = 1;
    this.resultados = []
    this.agregarResultado = function (result){
        this.resultados.push(result);
    }
    Usuario.prototype.toString = function(){
        var r = "Usuario " + this.email + " - Id " + this.id + "\n";
        r += "Nivel actual " + this.nivel + "\n";
        /*
        for(var i in this.resultados){
            r += this.resultados[i].toString() + "\n";
        }*/
        return r;
    }
}

function Partida(){
    this.id_partida = (new Date()).valueOf();
    this.resultados = [];
    this.agregarResultado = function(nivel, tiempo, vidas){
        this.resultados.push(new Resultado(nivel, tiempo, vidas));
    }
    this.getDatosNivel = function(nivel){
        return this.resultados.filter(function(actual_element){
            return actual_element.nivel == nivel;
        })[0];
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
            console.log(parts);              
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
            console.log(this)
        }
    }
    /**
     * A la partida actual que esta jugando usuario se añaden los resultados que corresponden a su nivel actual
     * @param usuario - usuario.
     * @param tiempo - tiempo en acabar el nivel.
     * @param vidas - vidas al acabar el nivel.
     */
    this.addResultados = function(usuario, tiempo, vidas){
        if(partida = this.getPartida(usuario.id, usuario.id_partida_actual)){
            console.log("Add resultados. if");
            console.log(partida)
            partida.resultados.push(new Resultado(usuario.nivel,tiempo,vidas))
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
}
function Resultado(nivel,tiempo,vidas){
    this.nivel = nivel;
    this.tiempo = tiempo;
    this.vidas = vidas;
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
            var nivel = new Nivel(x,this.array[x].platforms,this.array[x].gravity,this.array[x].starsNumber);
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