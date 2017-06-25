// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.

function Affdex() {
    this.divRoot = $("#affdex_elements")[0];
    this.width = 640;
    this.height = 480;
    this.faceMode = affdex.FaceDetectorMode.LARGE_FACES;
    //Construct a CameraDetector and specify the image width / height and face detector mode.
    this.detector = new affdex.CameraDetector(this.divRoot, this.width, this.height, this.faceMode);
    this.time = undefined;
    this.FaceInformation = [];
    //this.detectNow = true;
    //Enable detection of all Expressions and Emotion
    this.detector.detectAllEmotions();
    this.detector.detectAllExpressions();
    var self = this;
    this.onInitializeSuccess = function (callback) {
        this.detector.addEventListener("onInitializeSuccess", callback);
    }

    this.startDetection = function () {
        if (this.detector && !this.detector.isRunning) {
            console.log("Starting detector");
            this.detector.start();
        }
    }

    this.stopDetection = function () {
        if (this.detector && this.detector.isRunning) {
            console.log("Stopping detector");
            this.detector.removeEventListener();
            this.detector.stop();
        }
    }
    this.resetDetection = function () {
        console.log("Clicked the reset button");
        if (this.detector && this.detector.isRunning) {
            this.detector.reset();
        }
    }
    this.onWebcamConnectSuccess = function (callback) {
        this.detector.addEventListener("onWebcamConnectSuccess", callback);
    }
    this.onWebcamConnectFailure = function (callback) {
        this.detector.addEventListener("onWebcamConnectFailure", callback);
    }
    this.onStopSuccess = function (callback) {
        this.detector.addEventListener("onStopSuccess", callback);
    }
    this.onImageResultsSuccess = function (callback) {
        this.detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp){
            console.log(faces);
            console.log("Number of faces found: " + faces.length);
            if ((faces.length > 0) && (Date.now() - this.time) / 1000 > 2) {
                this.time = Date.now();
                evalEmotions(faces[0].expressions);
                self.FaceInformation.push({
                    "time":timestamp,
                    "emotions":faces[0].emotions,
                    "expressions":faces[0].expressions
                });
            }
        });
    }
    /*
    this.setDetectionFlag = function(){
        this.detectNow = true;
    }
    */
}

function onInitializeSuccessDEMO () {
    $("#face_video_canvas").css("display", "block");
    $("#face_video").css("display", "none");
    this.time = Date.now();
}

//Add a callback to notify when camera access is allowed
function onWebcamConnectSuccessDEMO () {
    console.log("Webcam access allowed");
}

function onWebcamConnectFailureDEMO (){
     console.log("Webcam access denied");
}

function onStopSuccessDEMO () {
    console.log("The detector reports stopped");
}

/*
function onImageResultsSuccessDEMO (faces, image, timestamp) {
    console.log("Number of faces found: " + faces.length);
    if ((faces.length > 0 && (Date.now() - time) / 1000 > 2) || this.detectNow) {
        console.log(faces[0]);
        console.log((Date.now() - time) / 1000);
        this.time = Date.now();
        evalEmotions(faces[0].expressions);
        console.log(timestamp);
        console.log(faces[0].emotions);
        console.log(faces[0].expressions);
        self.FaceInformation.push({
            "time":timestamp,
            "emotions":faces[0].emotions,
            "expressions":faces[0].expressions
        });
    }
}
*/