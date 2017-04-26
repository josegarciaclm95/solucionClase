/**
    * Función auxiliar para la realización de pruebas. Se insertan usuarios en el modelo y en persistencia, 
    * incluyendo las inserciones pertinentes en la coleccion partidas
    * @param  string tokenUrl
    * @param  string serverUrl
*/
function BeyondVerbalAPI(tokenUrl, serverUrl){
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        console.log("This browser can use Beyond Verbal technoology");
    }
    else
    {
        alert('The File APIs are not fully supported in this browser. Beyond Verbal may not work');
    }
    this.options = {
        url: {
            tokenUrl: tokenUrl,
            serverUrl: serverUrl
        },
        apiKey: "26b904fc-9a12-4195-aba1-ce4b166bc4e5",
        token: ''
    };
    var self = this;
    this.authenticate = function () {
        proxy.authenticateBV(this.options)
           .fail(function (jqXHR, textStatus, errorThrown)
            {
                console.log(JSON.stringify(jqXHR) + errorThrown);
            })
            .done(function (data)
            {
                console.log("AUTHENTICATE CON EXITO");
                console.log('sucess::' + JSON.stringify(data));
                console.log(JSON.parse(data));
                var token = JSON.parse(data);
                self.options.token = token.access_token;
            });
    }
    this.analyzeFile = function (content, interval) {
        var dfd = $.Deferred();
        var startUrl = this.options.url.serverUrl+'start';
        console.log("LLEGADA A ANALYZE_FILE");
        $.ajax({
            url: startUrl,
            headers: { 'Authorization': "Bearer " + self.options.token },
            type: "POST",
            cache: false,
            data: JSON.stringify({ dataFormat: { type: "WAV" } }),
            contentType: 'application/x-www-form-urlencoded',
            dataType: 'text'
        })
        .then(function (data)
        {
            var recID = data.recordingId ? data.recordingId : JSON.parse(data).recordingId;
            var upStreamUrl = self.options.url.serverUrl + recID;
            console.log("PASO PREVIO A ENVIO DE DATOS - ANALYZE_FILE");
            //post content for analysis
            $.ajax({
                url: upStreamUrl,
                headers: { 'Authorization': "Bearer " + self.options.token },
                data: content,
                contentType: false,
                processData: false,
                cache: false,
                dataType: 'text',
                type: "POST"
            })
            .then(dfd.resolve, dfd.reject);
        }, dfd.reject);
        return dfd.promise().always(function (){});
    }
    this.authenticate();
}

function Show(json)
{
    console.log(JSON.parse(json))
}