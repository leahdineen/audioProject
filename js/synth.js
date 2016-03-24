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
        "delay": 0,
        "reverbTime": 0,

        "enabled": false
    }

    this.voices = {};

    // irHall = new reverbObject('https://raw.githubusercontent.com/cwilso/WebAudio/master/sounds/irHall.ogg', this);
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
            this.imag[i] = (8.0 * Math.pow(-1, (i-1)/2)) / (Math.pow(Math.PI, 2) * Math.pow(i, 2));
        }
    }
    else if (type == "sawtooth"){
        for(var i = 1; i < 4096; i++){
            this.imag[i] =  (2.0 * Math.pow(-1, i)) / (Math.PI * i);
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
};

Synth.prototype.setPan = function(val){
    this.pan = val;
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
        , decay = 0//this.decay
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

        // Reverb
        if (this.reverb.enabled) {
            voice.convolver = this.context.createConvolver();
            buildImpulse(this.context, voice.convolver);

            voice.reverbDelay = this.context.createDelay(5.0);
            console.log(voice.convolver.buffer)
            voice.convolver.connect(voice.reverbDelay);
            
            
            voice.volumeNode.connect(voice.convolver);
            voice.convolver.connect(this.context.destination);
        }
        

        // Stereo Pan
        voice.panNode = this.context.createStereoPanner();
        voice.panNode.pan.value = this.pan;

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
                    oscParam = voice.oscillator.frequency;
                    break;
                case "volume":
                    oscParam = voice.volumeNode.gain;
                    break;
                case "pan":
                    // Need to scale pan since its values lie in [-1, 1] rather than [0, 1]
                    opts.gain = opts.gain * 2.0 - 1;
                    oscParam = voice.panNode.pan;
                    break;
                default:
                    oscParam = voice.volumeNode.gain;
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
                    envParam = voice.oscillator.frequency;
                    break;
                case "volume":
                    envParam = voice.volumeNode.gain;
                    break;
                case "pan":
                    // Map pan sustain from [0, 1] to [-1, 1]
                    opts.sustain = this.envelopeOpts1.sustain * 2.0 - 1;
                    envParam = voice.panNode.pan;
                    break;
                default:
                    envParam = voice.volumeNode;
                    break;
            }

            voice.env = new Envelope(opts, this.context);
            voice.env.connect(envParam);
            voice.env.trigger();
        }

        voice.oscillator.start();
        voice.oscillator.connect(voice.gainNode);
        voice.gainNode.connect(voice.panNode);
        voice.panNode.connect(voice.volumeNode);
        voice.volumeNode.connect(this.context.destination);
    }
};

Synth.prototype.stop = function(freq){

    var voice = this.voices[freq];
    if (voice !== undefined){
        // Start release phase of ADSR envelope if enabled
        if (voice.env !== undefined){
            voice.env.finish();
            if (this.envelopeOpts1.param !== "volume"){
                voice.oscillator.stop();
            }
        }
        else{
            voice.oscillator.stop();
        }
        delete this.voices[freq];
    }
};