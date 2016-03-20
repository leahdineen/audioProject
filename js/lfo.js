/*
    This is an abstraction of a typical Low Frequency Oscillator. This allows us
    to oscillate arbitrary AudioParams in the Web Audio API.
*/
function LFO(opts, context){
    this.gain = opts.gain;
    this.frequency = opts.frequency;
    this.param = null;
    this.context = context;
    this.osc = null;
    this.oscGain = null;
}

LFO.prototype.connect = function(param){
    this.param = param;
};

LFO.prototype.disconnect = function(){
    this.param = null;
};

LFO.prototype.start = function(){

    if (this.param === null) return;

    // Initialize LFO
    this.osc = this.context.createOscillator();
    this.osc.frequency.value = this.frequency;
    this.oscGain = this.context.createGain();
    this.oscGain.gain.value = this.gain;

    // Wire it up
    this.osc.connect(this.oscGain);
    this.oscGain.connect(this.param);
    this.osc.start();
};

LFO.prototype.stop = function(){
    this.osc.stop();
};

LFO.prototype.oscillate = function(param){
    this.connect(param);
    this.start();
};