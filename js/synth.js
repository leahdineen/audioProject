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

    // Default envelope parameters
    this.envelopeOpts = {
        "attack" : 0,
        "decay" : 0,
        "sustain" : 0.5,
        "release" : 0
    };
};

Synth.prototype.setWaveForm = function(type){
    this.opts.type = type;
};

Synth.prototype.setFrequency = function(freq){
    // In Hz
    this.opts.frequency = freq;
};

Synth.prototype.setVolume = function(val){
    this.volume = val;
    this.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);
};

Synth.prototype.play = function(delay){

    if (!this.isPlaying){
        this.oscillator = this.context.createOscillator();
        
        // Set options up
        this.oscillator.type = this.opts.type;
        this.oscillator.frequency.value = this.opts.frequency;

        // Amplitude for ADSR envelope
        this.gainNode = this.context.createGain();

        // Master volume
        this.volumeNode = this.context.createGain();
        this.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);

        this.oscillator.start(delay || 0);
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.volumeNode);
        this.volumeNode.connect(this.context.destination);

        // Trigger our ADSR amplitude envelope
        this.amplitudeEnv = new Envelope(this.envelopeOpts, this.context);
        this.amplitudeEnv.connect(this.gainNode.gain);
        this.amplitudeEnv.trigger();
        
        this.isPlaying = true;
    }
};

Synth.prototype.stop = function(delay){
    if (this.isPlaying){

        // Start release phase of ADSR envelope
        this.amplitudeEnv.finish();

        this.isPlaying = false;
    }
};