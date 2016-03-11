/ * This is mainly a wrapper class to play Audio through
    the Web Audio API using an OscillatorNode connected
    to an AudioContext.
*/
function Synth(opts){
    this.oscillator = null;
    this.context = null;
    this.init(opts);
}

Synth.prototype.init = function(opts){

    // Cross browser compatibility for Web Audio API
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();

    this.oscillator = this.context.createOscillator();

    // Default to square wave at A4
    var defaultOpts = {type: 'square', frequency: 440};
    Object.assign(opts || defaultOpts, this.oscillator);
    this.oscillator.connect(this.context.destination);
};

Synth.prototype.setWaveForm = function(type){
    this.oscillator.type = type;
};

Synth.prototype.setFrequency = function(freq){
    // In Hz
    this.oscillator.frequency = freq;
};

Synth.prototype.play = function(delay){
    this.oscillator.start(delay || 0);
};

Synth.prototype.stop = function(delay){
    this.oscillator.stop(delay || 0);
};