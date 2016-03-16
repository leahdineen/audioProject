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
    this.pan = 0;

    // Default envelope parameters
    this.envelopeOpts = {
        "attack" : 0,
        "decay" : 0,
        "sustain" : 0.5,
        "release" : 0
    };

    // Default LFO1 options
    this.lfoOpts1 = {
        "param" : "volume",
        "frequency":  2.0,
        "gain" : 0.25,
        "enabled": false
    };

    this.voices = {};
};

Synth.prototype.setWaveForm = function(type){
    this.opts.type = type;
};

Synth.prototype.setVolume = function(val){
    this.volume = val;
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
        voice.oscillator.type = this.opts.type;
        voice.oscillator.frequency.value = freq;

        // Amplitude for ADSR envelope
        voice.gainNode = this.context.createGain();

        // Master volume
        voice.volumeNode = this.context.createGain();
        voice.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);

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
                    // Need to scale frequency oscillation since other params
                    // take on a much smaller range of values ([0, 1] or [-1, 1])
                    opts.gain = opts.gain * 50.0;
                    oscParam = voice.oscillator.frequency;
                    break;
                case "volume":
                    oscParam = voice.volumeNode.gain;
                    break;
                case "pan":
                    // Need to scale pan since its values lie in [-1, 1] rather than [0, 1]
                    opts.gain = opts.gain * 2.0;
                    oscParam = voice.panNode.pan;
                    break;
                default:
                    oscParam = voice.volumeNode.gain;
                    break;
            }
            voice.lfo = new LFO(opts, this.context);
            voice.lfo.oscillate(oscParam);
        }

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