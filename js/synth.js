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

    this.voices = {};
};

Synth.prototype.setWaveForm = function(type){
    this.opts.type = type;
};

Synth.prototype.setVolume = function(val){
    this.volume = val;
    this.volumeNode.gain.setValueAtTime(this.volume, this.context.currentTime);
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

        // Reverb
        voice.convolver = this.context.createConvolver();
        var buffer = this.context.createBuffer(2, this.context.sampleRate * 2.0, this.context.sampleRate);

        var source = this.context.createBufferSource();
        source.buffer = buffer;
        

        for (var channel = 0; channel < 2; channel ++) {
            // This gives us the actual array that contains the data
           var nowBuffering = buffer.getChannelData(channel);
           for (var i = 0; i < this.context.sampleRate * 2.0; i++) {
             // Math.random() is in [0; 1.0]
             // audio needs to be in [-1.0; 1.0]
             nowBuffering[i] = Math.random() * 2 - 1;
           }
        }

        voice.convolver.buffer = source.buffer;

        // Stereo Pan
        voice.panNode = this.context.createStereoPanner();
        voice.panNode.pan.value = this.pan;

        voice.oscillator.start();
        voice.oscillator.connect(voice.gainNode);
        voice.gainNode.connect(voice.volumeNode);
        voice.volumeNode.connect(voice.convolver);
        voice.volumeNode.connect(voice.panNode);
        voice.panNode.connect(this.context.destination);

        voice.volumeNode.connect(voice.convolver)
        voice.convolver.connect(this.context.destination);

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