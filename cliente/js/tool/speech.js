var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

function _SpeechRecognition(){
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 5;
    this.grammar = "";
    this.sentences = 0;
    this.infoJuegoPrevio = {};
    this.recording = false;
    var self = this;
    this.startRecognition = function(){
        this.recognition.onend = function(event) {
            self.startRecognition();
        }
        this.recognition.start();
    }
    /**
     * Important! Before stopping the Recognition, the onend callback must be 
     * deleted, in order to be able to really stop the service (the onend callback
     * starts the recnogition again otherwise)
     */
    this.stopRecognition = function(){
        this.recognition.onend = function () {}
        this.recognition.stop();
    }
    this.setGrammar = function(rules, term_type, term_name){
        this.grammar = '#JSGF V1.0; grammar' + term_type + '; public <' + term_name + '> = ' + rules.join(' | ') + ' ;'
        var speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(this.grammar, 1);
        this.recognition.grammars = speechRecognitionList;
    }
    this.onResult = function(callback){
        self.stopRecognition();
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

function _SpeechSynthesis(lang, fe_male_voice, pitch, rate){
    this.synth = window.speechSynthesis;
    this.pitch = pitch;
    this.rate = rate;
    var self = this;
    this.synth.onvoiceschanged = function(){
        self.choice = self.synth.getVoices().filter(function(voice){
            return voice.lang === lang && voice.name.includes(fe_male_voice);
        })[0];
    }
    this.speak = function(text){
        var utter = new SpeechSynthesisUtterance(text);
        utter.voice = this.choice;
        utter.pitch = this.pitch;
        utter.rate = this.rate;
        this.synth.speak(utter);
    }
}

/************** FUNCIONES DE PRUEBA PARA LOS CALLBACKS*********************/

function onResultDemo(event) {
    var text = $("#sentence-holder").text().toLowerCase();
    var split_text = text.split(" ");
    var results = event.results[0];
    var hits = 0;
    for(var i = 0; i < results.length; i++){
        var result_text = results[i].transcript.toLowerCase().split(" ");
        for(var j = 0; j < split_text.length; j++){
            if(result_text.indexOf(split_text[j]) != -1){
                console.log(split_text[j] + " -> is in -> " + results[i].transcript);
                hits++;
            }
        }
        if(hits / split_text.length >= 0.6){
            $("#sentence-holder").css("color", "#008000");
            $("#sentence-holder").append("<h3>Well done!</h3>");
            stopListening();
            $("#sentence-holder").slideToggle(1000, function(){
                    var s_number = parseInt($(".current > a").attr("id").slice(8));
                    if(s_number + 1 == recognition.sentences){
                        toggleRecording(recognition);
                        //mostrarResultados();
                        nivelCompletado(recognition.infoJuegoPrevio.tiempo, recognition.infoJuegoPrevio.vidas)
                    } else {
                        $("#sentence" + (s_number + 1))[0].click();
                    }
                    $("#sentence-holder").slideToggle();
                });
            break;
        } else {
            hits = 0;
        }
    }
    console.log("Fin del bucle - Hits = " + hits);
    if(hits == 0){
        $("#sentence-holder").css("color", "#FF0000");
    }
}

function onSpeechEndDemo(event) {
    console.log("Fin del speech");
    this.stop();
    console.log(this);
}

function onNoMatchDemo(event) {
    console.log("No se ha entendido");
}

function onErrorDemo(event){
    console.log(event);
    console.log("Ha habido un error");
}