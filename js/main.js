(function(){

var synth = null;
var phase1 = 0;
var phase2 = 0;

var init = function(){
    synth = new Synth();

    // Phase
    var phase1 = document.getElementById('phase1');
    phase1.noUiSlider.on('update', function(values) {
        phase1 = parseFloat(values[0]);
        synth.setPhase(phase1, 0);
    });

    var phase2 = document.getElementById('phase2');
    phase2.noUiSlider.on('update', function(values) {
        phase2 = parseFloat(values[0]);
        synth.setPhase(phase2, 1);
    });

    // Waveforms
    var radios1 = document.forms["oscillator1"].elements["wave"];
    for(var i = 0, max = radios1.length; i < max; i++) {
        radios1[i].onclick = function() {
            synth.setWaveForm(this.value, 0);
            // need to set phase every time we change wave form
            synth.setPhase(phase1, 0);
        };
    }

    var radios2 = document.forms["oscillator2"].elements["wave"];
    for(var i = 0, max = radios2.length; i < max; i++) {
        radios2[i].onclick = function() {
            synth.setWaveForm(this.value, 1);
            // need to set phase every time we change wave form
            synth.setPhase(phase2, 1);
        };
    }

    // Volume
    var vol1 = document.getElementById('vol1');
    vol1.noUiSlider.on('update', function(values) {
        synth.setVolume(parseFloat(values[0]), 0);
    });

    var vol2 = document.getElementById('vol2');
    vol2.noUiSlider.on('update', function(values) {
        synth.setVolume(parseFloat(values[0]), 1);
    });
    
    // Panning
    var pan1 = document.getElementById('pan1');
    pan1.noUiSlider.on('update', function(values) {
        synth.setPan(parseFloat(values[0]), 0);
    });

    var pan2 = document.getElementById('pan2');
    pan2.noUiSlider.on('update', function(values) {
        synth.setPan(parseFloat(values[0]), 1);
    });

    // ADSR1 
    var envelope = document.forms["adsr1"];
    envelope.elements["param"].addEventListener("change", function(values){
        synth.envelopeOpts1.param = this.value;
    });
    var attack1 = document.getElementById('attack1');
    attack1.noUiSlider.on('update', function(values) {
        synth.envelopeOpts1.attack = parseFloat(values[0]);
    });
    var decay1 = document.getElementById('decay1');
    decay1.noUiSlider.on('update', function(values) {
        synth.envelopeOpts1.decay = parseFloat(values[0]);
    });
    var sustain1 = document.getElementById('sustain1');
    sustain1.noUiSlider.on('update', function(values) {
        synth.envelopeOpts1.sustain = parseFloat(values[0]);
    });
    var release1 = document.getElementById('release1');
    release1.noUiSlider.on('update', function(values) {
        synth.envelopeOpts1.release = parseFloat(values[0]);
    });
    var adsr1_enabled = document.getElementById('adsr1-enabled');
    adsr1_enabled.addEventListener("click", function(){
        synth.envelopeOpts1.enabled = !synth.envelopeOpts1.enabled;
    });

    // ADSR2
    var envelope2 = document.forms["adsr2"];
    envelope2.elements["param"].addEventListener("change", function(){
        synth.envelopeOpts2.param = this.value;
    });
    var attack2 = document.getElementById('attack2');
    attack2.noUiSlider.on('update', function(values) {
        synth.envelopeOpts2.attack = parseFloat(values[0]);
    });
    var decay2 = document.getElementById('decay2');
    decay2.noUiSlider.on('update', function(values) {
        synth.envelopeOpts2.decay = parseFloat(values[0]);
    });
    var sustain2 = document.getElementById('sustain2');
    sustain2.noUiSlider.on('update', function(values) {
        synth.envelopeOpts2.sustain = parseFloat(values[0]);
    });
    var release2 = document.getElementById('release2');
    release2.noUiSlider.on('update', function(values) {
        synth.envelopeOpts2.release = parseFloat(values[0]);
    });
    var adsr2_enabled = document.getElementById('adsr2-enabled');
    adsr2_enabled.addEventListener("click", function(){
        synth.envelopeOpts2.enabled = !synth.envelopeOpts2.enabled;
    });

    // LFO1
    var lfo1 = document.forms["lfo1"];
    lfo1.elements["param"].addEventListener("change", function(){
        synth.lfoOpts1.param = this.value;
    });
    var lfo1_rate = document.getElementById('lfo1-rate');
    lfo1_rate.noUiSlider.on('update', function(values) {
        synth.lfoOpts1.frequency = parseFloat(values[0]);
    });
    var lfo1_gain = document.getElementById('lfo1-gain');
    lfo1_gain.noUiSlider.on('update', function(values) {
        synth.lfoOpts1.gain = parseFloat(values[0]);
    });
    var lfo1_enabled = document.getElementById('lfo1-enabled');
    lfo1_enabled.addEventListener("click", function(){
        synth.lfoOpts1.enabled = !synth.lfoOpts1.enabled;
    });

    // LFO2
    var lfo2 = document.forms["lfo2"];
    lfo2.elements["param"].addEventListener("change", function(){
        synth.lfoOpts2.param = this.value;
    });
    var lfo2_rate = document.getElementById('lfo2-rate');
    lfo2_rate.noUiSlider.on('update', function(values) {
        synth.lfoOpts2.frequency = parseFloat(values[0]);
    });
    var lfo2_gain = document.getElementById('lfo2-gain');
    lfo2_gain.noUiSlider.on('update', function(values) {
        synth.lfoOpts2.gain = parseFloat(values[0]);
    });
    var lfo2_enabled = document.getElementById('lfo2-enabled');
    lfo2_enabled.addEventListener("click", function(){
        synth.lfoOpts2.enabled = !synth.lfoOpts2.enabled;
    });

    // Filter 1
    var filter1 = document.forms["filter1"];
    filter1.elements["type"].addEventListener("change", function(){
        synth.filterOpts1.type = this.value;
    });
    var filter1_frequency = document.getElementById('filter1-frequency');
    filter1_frequency.noUiSlider.on('update', function(values) {
        // Frequency isn't represented very well on a linear scale
        // like range sliders have, so we need to change the scaling.
        synth.filterOpts1.frequency = logScale(parseFloat(values[0]), 0, 50, 10, 20000);
    });
    var filter1_enabled = document.getElementById('filter1-enabled');
    filter1_enabled.addEventListener("click", function(){
        synth.filterOpts1.enabled = !synth.filterOpts1.enabled;
    });

    // Filter 2
    var filter2 = document.forms["filter2"];
    filter2.elements["type"].addEventListener("change", function(){
        synth.filterOpts2.type = this.value;
    });
    var filter2_frequency = document.getElementById('filter2-frequency');
    filter2_frequency.noUiSlider.on('update', function(values) {
        // Frequency isn't represented very well on a linear scale
        // like range sliders have, so we need to change the scaling.
        synth.filterOpts2.frequency = logScale(parseFloat(values[0]), 0, 50, 10, 20000);
    });
    var filter2_enabled = document.getElementById('filter2-enabled');
    filter2_enabled.addEventListener("click", function(){
        synth.filterOpts2.enabled = !synth.filterOpts2.enabled;
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