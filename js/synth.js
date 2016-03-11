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
};

Synth.prototype.setWaveForm = function(type){
    this.opts.type = type;
};

Synth.prototype.setFrequency = function(freq){
    // In Hz
    this.opts.frequency = freq;
};

Synth.prototype.play = function(delay){

    if (!this.isPlaying){
        this.oscillator = this.context.createOscillator();
        // Set options up
        for (var o in this.opts){
            this.oscillator[o] = this.opts[o];
        }
        this.oscillator.connect(this.context.destination);
        this.oscillator.start(delay || 0);
        this.isPlaying = true;
    }
};

Synth.prototype.stop = function(delay){
    if (this.isPlaying){
        this.oscillator.stop();
        this.oscillator.disconnect(this.context.destination);  
        this.isPlaying = false;
    }
};