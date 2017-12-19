function Evaluator() {
    this.face_lost = 0;
    this.keylogger = new KeyLogger();
    this.keylogger.start();
    this.startTime = "";
    this.tries = 0;
    var self = this;
    this.leave = function(){
        leave = confirm("Estás en medio de una partida. Si sales antes de llegar a la fase de resultados tu progreso se perderá y tendrás que volver a empezar. ¿Estás seguro?");
        if (leave == true) {
            proxy.stopPlaying();
        }
    }
    
    this.faceLost = function(){
        this.face_lost++;
    }

    this.startPlaying = function () {
        this.startTime = new Date();
    }

    this.newTry = function(){
        this.tries++;
    }

    this.resetKeylogger = function(){
        this.keylogger.stop();
        this.keylogger = new KeyLogger();
        this.keylogger.start();
    }
    
}