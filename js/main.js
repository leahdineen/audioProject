(function(){

var synth = null;

var init = function(){
    synth = new Synth();

    // Phase
    var phase1 = document.forms["oscillator1"].elements["phase"];
    phase1.addEventListener("change", function() {
        synth.setPhase(this.value, 0);
    });

    var phase2 = document.forms["oscillator2"].elements["phase"];
    phase2.addEventListener("change", function() {
        synth.setPhase(this.value, 1);
    });

    // Waveforms
    var radios1 = document.forms["oscillator1"].elements["wave"];
    for(var i = 0, max = radios1.length; i < max; i++) {
        radios1[i].onclick = function() {
            synth.setWaveForm(this.value, 0);
            // need to set phase every time we change wave form
            synth.setPhase(phase1.value, 0);
        };
    }

    var radios2 = document.forms["oscillator2"].elements["wave"];
    for(var i = 0, max = radios2.length; i < max; i++) {
        radios2[i].onclick = function() {
            synth.setWaveForm(this.value, 1);
            // need to set phase every time we change wave form
            synth.setPhase(phase2.value, 1);
        };
    }

    // Volume
    var volume1 = document.forms["oscillator1"].elements["volume"];
    volume1.addEventListener("change", function() {
        synth.setVolume(parseFloat(this.value), 0);
    });

    var volume2 = document.forms["oscillator2"].elements["volume"];
    volume2.addEventListener("change", function() {
        synth.setVolume(parseFloat(this.value), 1);
    });
    
    // Panning
    var pan1 = document.forms["oscillator1"].elements["pan"];
    pan1.addEventListener("change", function() {
        synth.setPan(parseFloat(this.value), 0);
    });

    var pan2 = document.forms["oscillator2"].elements["pan"];
    pan2.addEventListener("change", function() {
        synth.setPan(parseFloat(this.value), 1);
    });

    // ADSR for amplitude
    var envelope = document.forms["adsr1"];
    envelope.elements["param"].addEventListener("change", function(){
        synth.envelopeOpts1.param = this.value;
    });
    envelope.elements["attack"].addEventListener("change", function(){
        synth.envelopeOpts1.attack = parseFloat(this.value);
    });
    envelope.elements["decay"].addEventListener("change", function(){
        synth.envelopeOpts1.decay = parseFloat(this.value);
    });
    envelope.elements["sustain"].addEventListener("change", function(){
        synth.envelopeOpts1.sustain = parseFloat(this.value);
    });
    envelope.elements["release"].addEventListener("change", function(){
        synth.envelopeOpts1.release = parseFloat(this.value);
    });
    envelope.elements["enabled"].addEventListener("click", function(){
        synth.envelopeOpts1.enabled = !synth.envelopeOpts1.enabled;
    });


    // LFO1
    var lfo1 = document.forms["lfo1"];
    lfo1.elements["param"].addEventListener("change", function(){
        synth.lfoOpts1.param = this.value;
    });
    lfo1.elements["rate"].addEventListener("change", function(){
        synth.lfoOpts1.frequency = this.value;
    });
    lfo1.elements["gain"].addEventListener("change", function(){
        synth.lfoOpts1.gain = this.value;
    });
    lfo1.elements["enabled"].addEventListener("click", function(){
        synth.lfoOpts1.enabled = !synth.lfoOpts1.enabled;
    });

    // Reverb
    var reverb = document.forms["reverb"];
    reverb.elements["enabled"].addEventListener("click", function(){
        synth.reverb.enabled = !synth.reverb.enabled;
    });
};

document.addEventListener("DOMContentLoaded", function(event){
    init();
});

document.addEventListener("keydown", function(event){
    var key = codeToChar(event.which || event.keyCode);
    var freq = keyToFrequency(key);
    if (freq !== 0){
        synth.play(freq);
    }
});

document.addEventListener("keyup", function(event){
    var key = codeToChar(event.which || event.keyCode);
    var freq = keyToFrequency(key);
    if (freq !== 0){
        synth.stop(freq);
    }
});
})();