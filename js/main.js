(function(){

var synth = null;

var init = function(){
    synth = new Synth();

    var radios = document.forms["waveType"].elements["wave"];
    for(var i = 0, max = radios.length; i < max; i++) {
        radios[i].onclick = function() {
            synth.setWaveForm(this.value);
        }
    }
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