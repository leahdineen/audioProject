(function(){

var synth = null;

var init = function(){
    synth = new Synth();

    // Phase
    var phase = document.forms["waveType"].elements["phase"];
    phase.addEventListener("change", function() {
        synth.setPhase(this.value);
    });

    // Waveforms
    var radios = document.forms["waveType"].elements["wave"];
    for(var i = 0, max = radios.length; i < max; i++) {
        radios[i].onclick = function() {
            synth.setWaveForm(this.value);
            // need to set phase every time we change wave form
            synth.setPhase(phase.value);
        };
    }

    // Volume
    var volume = document.forms["waveType"].elements["volume"];
    volume.addEventListener("change", function() {
        synth.setVolume(parseFloat(this.value));
    });
    
    // Panning
    var pan = document.forms["waveType"].elements["pan"];
    pan.addEventListener("change", function() {
        synth.setPan(parseFloat(this.value));
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