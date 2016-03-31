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

    // Default envelope parameters
    this.envelopeOpts2 = {
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

    // Default LFO1 options
    this.lfoOpts2 = {
        "param" : "volume",
        "frequency":  2.0,
        "gain" : 0.25,
        "enabled": false
    };

    // Default filter1 options
    this.filterOpts1 = {
        "type" : "lowpass",
        "frequency" : 20000,
        "enabled" : false
    };

    // Default filter2 options
    this.filterOpts2 = {
        "type" : "lowpass",
        "frequency" : 20000,
        "enabled" : false
    };

    this.reverb = {
        "delay": 0,
        "reverbTime": 0,

        "enabled": false
    };

    this.voices = {};

    // irHall = new reverbObject('https://raw.githubusercontent.com/cwilso/WebAudio/master/sounds/irHall.ogg', this);
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
    
    // normalize the waves
    var max = Math.max.apply(null, this.imag[osc].map(Math.abs));
    for(var i = 1; i < 4096; i++){
        this.imag[osc][i] /= max;
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

// function loadAudio(url, t) {

//     var request = new XMLHttpRequest();
//     request.open('GET', url, true);
//     request.responseType = 'arraybuffer';
//     request.onload = function() {
//         t.context.decodeAudioData(request.response, function(buffer) {
//             t.buffer = buffer;
//         });
//     }
//     request.send();
// }

function buildImpulse (context, convolver) {
      var rate = context.sampleRate
        , length = rate * 2.0//* this.seconds
        , decay = 2//this.decay
        , impulse = context.createBuffer(2, length, rate)
        , impulseL = impulse.getChannelData(0)
        , impulseR = impulse.getChannelData(1)
        , n, i;

      for (i = 0; i < length; i++) {
        n = i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      }

      convolver.buffer = impulse;
  }

// function reverbObject(url,t) {
//     this.source = url;
//     loadAudio(url,t);
// }

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

        // Waveform mixer node - master volume basically
        voice.mixerNode = this.context.createGain();
        voice.mixerNode.gain.setValueAtTime(0.0, this.context.currentTime);

        // Reverb
        if (this.reverb.enabled) {
            voice.convolver = this.context.createConvolver();
            buildImpulse(this.context, voice.convolver);
            console.log(voice.convolver)

            voice.volumeNode[0].connect(voice.convolver);
            voice.volumeNode[1].connect(voice.convolver);
            voice.convolver.connect(this.context.destination);
        }
        
        // Stereo Pan
        voice.panNode = [];
        voice.panNode[0] = this.context.createStereoPanner();
        voice.panNode[0].pan.value = this.pan[0];
        voice.panNode[1] = this.context.createStereoPanner();
        voice.panNode[1].pan.value = this.pan[1];

        voice.lfo = []

        // LFO 1
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
            voice.lfo[0] = new LFO(opts, this.context);
            voice.lfo[0].oscillate(oscParam);
        }

        // LFO 2
        if (this.lfoOpts2.enabled){
            var opts = {};
            for(var o in this.lfoOpts2) opts[o] = this.lfoOpts2[o];
            var oscParam;
            switch(opts.param){
                case "frequency":
                    // How many half steps our frequency range will be
                    var halfSteps = opts.gain * 10;
                    // Math to determine oscillation frequency
                    // See: https://en.wikipedia.org/wiki/Piano_key_frequencies
                    opts.gain = Math.abs(Math.pow(2, halfSteps / 12) * freq - freq) / 2;
                    oscParam = voice.oscillator[1].frequency;
                    break;
                case "volume":
                    oscParam = voice.volumeNode[1].gain;
                    break;
                case "pan":
                    // Need to scale pan since its values lie in [-1, 1] rather than [0, 1]
                    opts.gain = opts.gain * 2.0 - 1;
                    oscParam = voice.panNode[1].pan;
                    break;
                default:
                    oscParam = voice.volumeNode[1].gain;
                    break;
            }
            voice.lfo[1] = new LFO(opts, this.context);
            voice.lfo[1].oscillate(oscParam);
        }

        voice.env = []

        // ADSR Envelope 1
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

            voice.env[0] = new Envelope(opts, this.context);
            voice.env[0].connect(envParam);
            voice.env[0].trigger();
        }

        // ADSR Envelope 2
        if (this.envelopeOpts2.enabled){
            var opts = {};
            for(var o in this.envelopeOpts2) opts[o] = this.envelopeOpts2[o];
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
                    envParam = voice.oscillator[1].frequency;
                    break;
                case "volume":
                    envParam = voice.volumeNode[1].gain;
                    break;
                case "pan":
                    // Map pan sustain from [0, 1] to [-1, 1]
                    opts.sustain = this.envelopeOpts1.sustain * 2.0 - 1;
                    envParam = voice.panNode[1].pan;
                    break;
                default:
                    envParam = voice.volumeNode[1];
                    break;
            }

            voice.env[1] = new Envelope(opts, this.context);
            voice.env[1].connect(envParam);
            voice.env[1].trigger();
        }

        voice.oscillator[0].start();
        voice.oscillator[0].connect(voice.volumeNode[0]);
        voice.volumeNode[0].connect(voice.panNode[0]);
        voice.panNode[0].connect(voice.mixerNode);

        voice.oscillator[1].start();
        voice.oscillator[1].connect(voice.volumeNode[1]);
        voice.volumeNode[1].connect(voice.panNode[1]);
        voice.panNode[1].connect(voice.mixerNode);

        voice.filter = [];

        // Filter 1
        if (this.filterOpts1.enabled){
            voice.filter[0] = this.context.createBiquadFilter();
            voice.filter[0].type = this.filterOpts1.type;
            voice.filter[0].frequency.value = this.filterOpts1.frequency;
            voice.panNode[0].disconnect();
            voice.panNode[0].connect(voice.filter[0]);
            voice.filter[0].connect(voice.mixerNode);
        }

        // Filter 2
        if (this.filterOpts2.enabled){
            voice.filter[1] = this.context.createBiquadFilter();
            voice.filter[1].type = this.filterOpts2.type;
            voice.filter[1].frequency.value = this.filterOpts2.frequency;
            voice.panNode[1].disconnect();
            voice.panNode[1].connect(voice.filter[1]);
            voice.filter[1].connect(voice.mixerNode);
        }

        // If we start oscillating our waveform when it's not at a zero-crossing we 
        // get an annoying click. This mitigates that.
        voice.mixerNode.gain.setTargetAtTime(
            (this.volume[0] + this.volume[1]) / 2.0, 
            this.context.currentTime, 0.015);

        voice.mixerNode.connect(this.context.destination);
        
    }
};

Synth.prototype.stop = function(freq){

    var voice = this.voices[freq];
    if (voice !== undefined){
        // If we stop oscillating abruptly when we're not at a zero-crossing we 
        // get a click. So we quickly fade out instead.
        voice.mixerNode.gain.setTargetAtTime(0, this.context.currentTime, 0.015);
        delete this.voices[freq];
    }
};