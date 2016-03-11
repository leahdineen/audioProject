var radios = document.forms["waveType"].elements["wave"];
for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
        console.log(this.value);
    }
}