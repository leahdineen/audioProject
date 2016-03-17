/* This is mainly a wrapper class to play Audio through
    the Web Audio API using an OscillatorNode connected
    to an AudioContext.
*/
function Synth(opts){
    this.init(opts);
}

Synth.prototype.init = function(opts){
    // Cross browser compatibility for Web Audio API
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();

    // Default to square wave at A4
    var defaultOpts = {type: 'square', frequency: 440};
    this.opts = opts || defaultOpts;
    this.isPlaying = false;
    this.volume = 0.5;
    this.reverb = 1;
    this.pan = 0;

    // Default envelope parameters
    this.envelopeOpts = {
        "attack" : 0,
        "decay" : 0,
        "sustain" : 0.5,
        "release" : 0
    };

    this.voices = {};

    irHall = new reverbObject('https://raw.githubusercontent.com/cwilso/WebAudio/master/sounds/irHall.ogg', this);
};

Synth.prototype.setWaveForm = function(type){
    this.opts.type = type;
};

Synth.prototype.setVolume = function(val){
    this.volume = val;
    this.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);
};

Synth.prototype.setPan = function(val){
    this.pan = val;
};

// seconds that reverb plays for
Synth.prototype.setReverb = function(val){
    this.reverb = val;
};

function loadAudio(url, t) {

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        t.context.decodeAudioData(request.response, function(buffer) {
            t.buffer = buffer;
        });
    }
    request.send();
}

function reverbObject(url,t) {
    this.source = url;
    loadAudio(url,t);
}

Synth.prototype.play = function(freq){

    if (this.voices[freq] === undefined){

        this.voices[freq] = {};
        voice = this.voices[freq];

        voice.oscillator = this.context.createOscillator();
        
        // Set options up
        voice.oscillator.type = this.opts.type;
        voice.oscillator.frequency.value = freq;

        // Amplitude for ADSR envelope
        voice.gainNode = this.context.createGain();

        // Master volume
        voice.volumeNode = this.context.createGain();
        voice.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);

        // Reverb

        if (this.reverb > 0) {
            voice.convolver = this.context.createConvolver();
            voice.convolver.buffer = this.buffer;
            voice.volumeNode.connect(voice.convolver);
            voice.convolver.connect(this.context.destination);
        }
        

        // Stereo Pan
        voice.panNode = this.context.createStereoPanner();
        voice.panNode.pan.value = this.pan;

        voice.oscillator.start();
        voice.oscillator.connect(voice.gainNode);
        voice.gainNode.connect(voice.volumeNode);
        voice.volumeNode.connect(voice.panNode);
        voice.panNode.connect(this.context.destination);

        // Trigger our ADSR amplitude envelope
        voice.amplitudeEnv = new Envelope(this.envelopeOpts, this.context);
        voice.amplitudeEnv.connect(voice.gainNode.gain);
        voice.amplitudeEnv.trigger();

        
    }


};

Synth.prototype.stop = function(freq){

    if (this.voices[freq] !== undefined){

        // Start release phase of ADSR envelope
        this.voices[freq].amplitudeEnv.finish();
        delete this.voices[freq];
    }

};