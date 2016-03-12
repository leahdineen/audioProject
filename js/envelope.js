/*
    This is an abstraction of a typical ADSR envelope. This allows us
    to apply an envelope to arbitrary AudioParams in the Web Audio API.
*/
function Envelope(opts, context){
    this.attack = opts.attack;
    this.decay = opts.decay;
    this.sustain = opts.sustain;
    this.release = opts.release;
    this.param = null;
    this.context = context;
}

Envelope.prototype.connect = function(param){
    this.param = param;
};

Envelope.prototype.disconnect = function(){
    this.param = null;
};

Envelope.prototype.trigger = function(){
    if (this.param === null) return;

    // Attack ramp 
    this.param.setValueAtTime(0, this.context.currentTime);
    this.param.linearRampToValueAtTime(1.0, this.context.currentTime + this.attack);

    // Decay ramp
    this.param.linearRampToValueAtTime(this.sustain, this.context.currentTime + this.attack + this.decay);
};

Envelope.prototype.finish = function(){
    if (this.param === null) return;

    //Release ramp
    this.param.cancelScheduledValues(this.context.currentTime);
    this.param.linearRampToValueAtTime(0, this.context.currentTime + this.release);
};