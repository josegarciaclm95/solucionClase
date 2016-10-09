function Juego(){
    this.nombre = "Niveles";
    this.niveles = [];
    this.usuarios = [];
    this.agregarNivel = function(nivel){
        this.niveles.push(nivel);
    };
    this.agregarUsuario = function(usuario){
        this.usuarios.push(usuario);
    };
    /*
    this.buscarUsuario = function(nombre_usuario){
        var user_encontrado = null;
        console.log(this);
        for(var i = 0; i < this.usuarios.length ; i++){
            console.log(this.usuarios[i]);
            if (this.usuarios[i].nombre === nombre_usuario) {
                user_encontrado = this.usuarios[i];
            }
        }
        return user_encontrado;
    };
    */
    this.buscarUsuario = function(nombre_us){
        return this.usuarios.filter(function(actual_element){
            return actual_element.nombre == nombre_us;
        })[0];
    }
}
    
function Nivel(num){
    this.nivel = num;
}

function Usuario(nombre){
    this.nombre = nombre;
    this.puntuacion = 0;
}


module.exports.Juego = Juego;
module.exports.Usuario = Usuario;
module.exports.Nivel = Nivel;