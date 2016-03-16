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

    this.real = new Float32Array(4096);
    this.imag = new Float32Array(4096);
    this.imag[1] = 1.0; // initialize to sine

    this.isPlaying = false;
    this.volume = 0.5;
    this.pan = 0;
    this.phase = 0;

    // Default envelope parameters
    this.envelopeOpts = {
        "attack" : 0,
        "decay" : 0,
        "sustain" : 0.5,
        "release" : 0
    };

    this.voices = {};
};

Synth.prototype.setWaveForm = function(type){
    // reset real and imaginary to 0
    this.real = new Float32Array(4096);
    this.imag = new Float32Array(4096);

    if(type == "sine"){
        this.imag[1] = 1.0;
    }
    else if (type == "square"){
        for(var i = 1; i < 4096; i += 2){
            this.imag[i] = 4.0 / (Math.PI * i);
        }
    }
    else if (type == "triangle"){
        for(var i = 1; i < 4096; i += 2){
            this.imag[i] = (8.0 / Math.pow(Math.PI, 2)) * (Math.pow(-1, (i-1)/2) / Math.pow(i, 2));
        }
    }
    else if (type == "sawtooth"){
        for(var i = 1; i < 4096; i++){
            this.imag[i] =  2.0 / (Math.pow(-1, i) * Math.PI * i);
        }
    }
};

Synth.prototype.setPhase = function(val){
    var shift = 2 * Math.PI * (val/360);
    for(var i = 1; i < 4096; i++){
        this.real[i] = this.real[i] * Math.cos(shift) - this.imag[i] * Math.sin(shift);
        this.imag[i] = this.real[i] * Math.sin(shift) + this.imag[i] * Math.cos(shift);
    }
};

Synth.prototype.setVolume = function(val){
    this.volume = val;
    this.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);
};

Synth.prototype.setPan = function(val){
    this.pan = val;
};

Synth.prototype.play = function(freq){

    if (this.voices[freq] === undefined){

        this.voices[freq] = {};
        voice = this.voices[freq];

        voice.oscillator = this.context.createOscillator();
        
        // Set options up
        var wave = this.context.createPeriodicWave(this.real, this.imag);
        voice.oscillator.setPeriodicWave(wave);
        voice.oscillator.frequency.value = freq;

        // Amplitude for ADSR envelope
        voice.gainNode = this.context.createGain();

        // Master volume
        voice.volumeNode = this.context.createGain();
        voice.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);

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