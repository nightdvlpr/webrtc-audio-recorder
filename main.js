class Recorder {
    // chunks
    blb = [];

    // constructor
    constructor(recordButton, stopButton, pauseButton, saveButton, playButton) {
        this.recordButton = recordButton;
        this.stopButton = stopButton;
        this.pauseButton = pauseButton;
        this.saveButton = saveButton;
        this.playButton = playButton;

        if (this.chk()) this.domLoader();
        else {
            console.log(this.err);
        }
    }

    // check getUserMedia func in browser.
    chk() {
        if (!this.hasGetUserMedia()) {
            console.log('getUserMedia() is not supported in your browser!');
            return false;
        }
        return true;
    }

    hasGetUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    domLoader() {
        console.log('DOM Loading...');
        this.recordButton.addEventListener('click', this.start);
        this.recordButton.disabled = false;
        this.stopButton.addEventListener('click', this.stop);
        this.pauseButton.addEventListener('click', this.pause);
        this.saveButton.addEventListener('click', this.save);
        this.playButton.addEventListener('click', this.play);
    }

    getUserMedia() {
        // get audio stream from user's mic
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        }).then(this.handleStream).catch((err) => {
            console.log('Err => ' + err);
        });

        console.log('Request to get UserMedia has been sent.');
    }

    handleStream = (stream) => {
        console.log("👉 UserMedia's stream => ");
        console.log(stream);

        this.recorder = new MediaRecorder(stream, {mimeType: 'audio/webm'});
        this.recorder.audioChannels = 1;
        // listen to dataavailable, which gets triggered whenever we have
        this.recorder.addEventListener('dataavailable', this.onRecordingReady);

        console.log("👉 Send MediaStream to MediaRecorder for converting data to BlOB => ");
        console.log(this.recorder);
    }

    start = () => {
        console.log('_Start');
        this.recordButton.disabled = true;
        this.stopButton.disabled = false;
        this.pauseButton.disabled = false;
        this.recorder.start();
    }

    stop = () => {
        this.recordButton.disabled = false;
        this.playButton.disabled = false;
        this.stopButton.disabled = true;
        // Stopping the recorder will eventually trigger the `dataavailable` event and we can complete the recording process
        this.recorder.stop();
        console.log('_Stop');
    }

    pause = () => {
        this.recordButton.disabled = true;
        this.playButton.disabled = true;
        this.stopButton.disabled = false;
        // Stopping the recorder will eventually trigger the `dataavailable` event and we can complete the recording process
        if (this.recorder.state.toString() == "recording") this.recorder.pause();
        else if (this.recorder.state.toString() == "paused") this.recorder.resume();

        console.log(this.recorder.state);
    }

    save = () => {
        // save blob file as audio file (weba/mp3/etc)
        console.log('_Save');
    }

    play = () => {
        this.recordButton.disabled = false;
        // send to audio
        let audio = document.getElementById('audio');
        audio.src = URL.createObjectURL(this.blb);
        audio.play();
        console.log('_Play');
    }

    onRecordingReady = (e) => {
        console.log('_dataAvailable (when BLOB is ready!)');

        // e.data contains a blob representing the recording
        // push on variable
        this.blb = e.data;
        console.log(this.blb);

        // BLOB Extracting
        // const blb = new Blob(["Lorem ipsum sit"], {type: "text/plain"});
        const reader = new FileReader();

        // Start reading the blob as text.
        // readAsDataURL();readAsText();readAsArrayBuffer();
        reader.readAsDataURL(this.blb);

        // This fires after the blob has been read/loaded.

        reader.addEventListener('loadend', (e) => {
            const text = e.srcElement.result;
            console.log(text);

            // let myFile = this.blobToFile("my-voice.weba");
            // console.log(myFile);

            this.storing(text);
        });
    }

    storing = (text) => {
        console.log("_Storing...");

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("RES => ");
                console.log(this.responseText);
            }
        };
        xhttp.open("POST", "http://localhost/hielina/v1/getUserMedia", true);
        xhttp.send(text);
    }

    blobToFile(fileName) {
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        this.blb.lastModifiedDate = new Date();
        this.blb.name = fileName;
        return this.blb;
    }
}