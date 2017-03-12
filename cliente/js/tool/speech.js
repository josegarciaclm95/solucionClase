var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

function _SpeechRecognition(){
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 5;
    this.grammar = "";
    this.startRecognition = function(){
        this.recognition.start();
    }
    this.stopRecognition = function(){
        this.recognition.stop();
    }
    this.setGrammar = function(rules, term_type, term_name){
        this.grammar = '#JSGF V1.0; grammar' + term_type + '; public <' + term_name + '> = ' + rules.join(' | ') + ' ;'
        var speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(this.grammar, 1);
        recognition.grammars = speechRecognitionList;
    }
    this.onResult = function(callback){
        this.recognition.onresult = callback;
    }
    this.onSpeechEnd = function(callback) {
        this.recognition.onspeechend = callback;
    }
    this.onNoMatch = function(callback) {
        this.recognition.onnomatch = callback;
    }
    this.onError = function(callback){
        this.recognition.onerror = callback
    }
}   

/************** FUNCIONES DE PRUEBA PARA LOS CALLBACKS*********************/

function onResultDemo(event) {
    console.log(event);
    console.log("Tenemos resultados");
    console.log(event.results[0][0].transcript);
    console.log('Confidence: ' + event.results[0][0].confidence);
}

function onSpeechEndDemo(event) {
    console.log("Fin del speech");
    //this.stop();
}

function onNoMatchDemo(event) {
    console.log("No se ha entendido");
}

function onErrorDemo(event){
    console.log(event);
    console.log("Ha habido un error");
}