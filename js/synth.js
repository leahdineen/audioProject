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
        this.oscillator.type = this.opts.type;
        this.oscillator.frequency.value = this.opts.frequency;

        this.gainNode = this.context.createGain();

        this.oscillator.start(delay || 0);
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);

        // Attack ramp - hardcoded until we get envelope sliders
        this.gainNode.gain.setValueAtTime(0.001, this.context.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(1.0, this.context.currentTime + 0.5);

        // Decay ramp - hardcoded until we get envelope sliders
        this.gainNode.gain.linearRampToValueAtTime(0.5, this.context.currentTime + 1.0);
        
        this.isPlaying = true;
    }
};

Synth.prototype.stop = function(delay){
    if (this.isPlaying){

        // Release ramp - hardcoded until we get envelope sliders
        this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.001, this.context.currentTime + 1.5);
        this.isPlaying = false;
    }
};