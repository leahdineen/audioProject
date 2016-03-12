(function(){

var synth = null;

var init = function(){
    synth = new Synth();

    var radios = document.forms["waveType"].elements["wave"];
    for(var i = 0, max = radios.length; i < max; i++) {
        radios[i].onclick = function() {
            synth.setWaveForm(this.value);
        };
    }

    var volume = document.forms["waveType"].elements["volume"];
    volume.addEventListener("change", function() {
        synth.setVolume(parseFloat(this.value));
    });

    var envelope = document.forms["waveType"].elements["envelope"];
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
};

document.addEventListener("DOMContentLoaded", function(event){
    init();
});

document.addEventListener("keydown", function(event){
    var key = codeToChar(event.which || event.keyCode);
    var freq = keyToFrequency(key);
    if (freq !== 0){
        synth.setFrequency(freq);
        synth.play();
    }
});

document.addEventListener("keyup", function(event){
    synth.stop();
});
})();