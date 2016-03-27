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

    this.real = [];
    this.imag = [];
    // oscillator 1
    this.real[0] = new Float32Array(4096);
    this.imag[0] = new Float32Array(4096);
    this.imag[0][1] = 1.0; // initialize to sine
    // oscillator 2
    this.real[1] = new Float32Array(4096);
    this.imag[1] = new Float32Array(4096);
    this.imag[1][1] = 1.0; // initialize to sine


    this.isPlaying = false;
    this.volume = [0.5, 0.5];
    this.pan = [0, 0];
    this.phase = [0, 0];

    // Default envelope parameters
    this.envelopeOpts1 = {
        "param" : "volume",
        "attack" : 0,
        "decay" : 0,
        "sustain" : 0.5,
        "release" : 0,
        "max" : 1,
        "enabled" : false
    };

    // Default LFO1 options
    this.lfoOpts1 = {
        "param" : "volume",
        "frequency":  2.0,
        "gain" : 0.25,
        "enabled": false
    };

    this.reverb = {
        "enabled": false
    };

    this.voices = {};

    irHall = new reverbObject('https://raw.githubusercontent.com/cwilso/WebAudio/master/sounds/irHall.ogg', this);
};

Synth.prototype.setWaveForm = function(type, osc){
    // reset real and imaginary to 0
    this.real[osc] = new Float32Array(4096);
    this.imag[osc] = new Float32Array(4096);

    if(type == "sine"){
        this.imag[osc][1] = 1.0;
    }
    else if (type == "square"){
        for(var i = 1; i < 4096; i += 2){
            this.imag[osc][i] = 4.0 / (Math.PI * i);
        }
    }
    else if (type == "triangle"){
        for(var i = 1; i < 4096; i += 2){
            this.imag[osc][i] = (8.0 * Math.pow(-1, (i-1)/2)) / (Math.pow(Math.PI, 2) * Math.pow(i, 2));
        }
    }
    else if (type == "sawtooth"){
        for(var i = 1; i < 4096; i++){
            this.imag[osc][i] =  (2.0 * Math.pow(-1, i)) / (Math.PI * i);
        }
    }
};

Synth.prototype.setPhase = function(val, osc){
    var shift = 2 * Math.PI * (val/360);
    for(var i = 1; i < 4096; i++){
        this.real[osc][i] = this.real[osc][i] * Math.cos(shift) - this.imag[osc][i] * Math.sin(shift);
        this.imag[osc][i] = this.real[osc][i] * Math.sin(shift) + this.imag[osc][i] * Math.cos(shift);
    }
};

Synth.prototype.setVolume = function(val, osc){
    this.volume[osc] = val;
};

Synth.prototype.setPan = function(val, osc){
    this.pan[osc] = val;
};

function loadAudio(url, t) {

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        t.context.decodeAudioData(request.response, function(buffer) {
            t.buffer = buffer;
        });
    };
    request.send();
}

function reverbObject(url,t) {
    this.source = url;
    loadAudio(url,t);
}


//TODO: REFACTOR THIS MONSTROSITY
Synth.prototype.play = function(freq){

    if (this.voices[freq] === undefined){

        this.voices[freq] = {};
        voice = this.voices[freq];

        voice.oscillator = [];
        voice.oscillator[0] = this.context.createOscillator();
        voice.oscillator[1] = this.context.createOscillator();
        
        // Set options up
        var wave1 = this.context.createPeriodicWave(this.real[0], this.imag[0]);
        voice.oscillator[0].setPeriodicWave(wave1);
        voice.oscillator[0].frequency.value = freq;
        var wave2 = this.context.createPeriodicWave(this.real[1], this.imag[1]);
        voice.oscillator[1].setPeriodicWave(wave2);
        voice.oscillator[1].frequency.value = freq;

        // Oscillator volume
        voice.volumeNode = []
        voice.volumeNode[0] = this.context.createGain();
        voice.volumeNode[0].gain.setValueAtTime(this.volume[0], this.context.currentTime);
        voice.volumeNode[1] = this.context.createGain();
        voice.volumeNode[1].gain.setValueAtTime(this.volume[1], this.context.currentTime);

        // Reverb
        if (this.reverb.enabled) {
            voice.convolver = this.context.createConvolver();
            voice.convolver.buffer = this.buffer;
            // probably shouldn't be using volumeNode[0] here
            // need to create a master volume node?
            voice.volumeNode[0].connect(voice.convolver);
            voice.convolver.connect(this.context.destination);
        }
        

        // Stereo Pan
        voice.panNode = [];
        voice.panNode[0] = this.context.createStereoPanner();
        voice.panNode[0].pan.value = this.pan[0];
        voice.panNode[1] = this.context.createStereoPanner();
        voice.panNode[1].pan.value = this.pan[1];

        // LFO
        if (this.lfoOpts1.enabled){
            var opts = {};
            for(var o in this.lfoOpts1) opts[o] = this.lfoOpts1[o];
            var oscParam;
            switch(opts.param){
                case "frequency":
                    // How many half steps our frequency range will be
                    var halfSteps = opts.gain * 10;
                    // Math to determine oscillation frequency
                    // See: https://en.wikipedia.org/wiki/Piano_key_frequencies
                    opts.gain = Math.abs(Math.pow(2, halfSteps / 12) * freq - freq) / 2;
                    oscParam = voice.oscillator[0].frequency;
                    break;
                case "volume":
                    oscParam = voice.volumeNode[0].gain;
                    break;
                case "pan":
                    // Need to scale pan since its values lie in [-1, 1] rather than [0, 1]
                    opts.gain = opts.gain * 2.0 - 1;
                    oscParam = voice.panNode[0].pan;
                    break;
                default:
                    oscParam = voice.volumeNode[0].gain;
                    break;
            }
            voice.lfo = new LFO(opts, this.context);
            voice.lfo.oscillate(oscParam);
        }

        // ADSR Envelope
        if (this.envelopeOpts1.enabled){
            var opts = {};
            for(var o in this.envelopeOpts1) opts[o] = this.envelopeOpts1[o];
            var envParam;
            switch(opts.param){
                case "frequency":
                    // Peak of attack is at main frequency
                    opts.max = freq;

                    // How many half steps we sustain to
                    var halfSteps = (opts.sustain - 0.5) * 10;

                    // Math to determine sustain frequency
                    // See: https://en.wikipedia.org/wiki/Piano_key_frequencies
                    opts.sustain = Math.pow(2, halfSteps / 12) * freq;
                    envParam = voice.oscillator[0].frequency;
                    break;
                case "volume":
                    envParam = voice.volumeNode[0].gain;
                    break;
                case "pan":
                    // Map pan sustain from [0, 1] to [-1, 1]
                    opts.sustain = this.envelopeOpts1.sustain * 2.0 - 1;
                    envParam = voice.panNode[0].pan;
                    break;
                default:
                    envParam = voice.volumeNode[0];
                    break;
            }

            voice.env = new Envelope(opts, this.context);
            voice.env.connect(envParam);
            voice.env.trigger();
        }

        voice.oscillator[0].start();
        voice.oscillator[0].connect(voice.volumeNode[0]);
        voice.volumeNode[0].connect(voice.panNode[0]);
        voice.panNode[0].connect(this.context.destination);

        voice.oscillator[1].start();
        voice.oscillator[1].connect(voice.volumeNode[1]);
        voice.volumeNode[1].connect(voice.panNode[1]);
        voice.panNode[1].connect(this.context.destination);
    }
};

Synth.prototype.stop = function(freq){

    var voice = this.voices[freq];
    if (voice !== undefined){
        // Start release phase of ADSR envelope if enabled
        if (voice.env !== undefined){
            voice.env.finish();
            if (this.envelopeOpts1.param !== "volume"){
                voice.oscillator[0].stop();
                voice.oscillator[1].stop();
            }
        }
        else{
            voice.oscillator[0].stop();
            voice.oscillator[1].stop();
        }
        delete this.voices[freq];
    }
};