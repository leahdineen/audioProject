(function(){

var synth = null;

var init = function(){
    synth = new Synth();

    // Waveforms
    var radios = document.forms["waveType"].elements["wave"];
    for(var i = 0, max = radios.length; i < max; i++) {
        radios[i].onclick = function() {
            synth.setWaveForm(this.value);
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
    var envelope = document.forms["adsr"];
    envelope.elements["attack"].addEventListener("change", function(){
        synth.envelopeOpts.attack = parseFloat(this.value);
    });
    envelope.elements["decay"].addEventListener("change", function(){
        synth.envelopeOpts.decay = parseFloat(this.value);
    });
    envelope.elements["sustain"].addEventListener("change", function(){
        synth.envelopeOpts.sustain = parseFloat(this.value);
    });
    envelope.elements["release"].addEventListener("change", function(){
        synth.envelopeOpts.release = parseFloat(this.value);
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

    var reverb = document.forms["waveType"].elements["reverb"];
    reverb.addEventListener("change", function() {
        synth.setReverb(parseFloat(this.value));
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