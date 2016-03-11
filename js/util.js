var codeToChar = function(code){
    switch(code){
        // Special cases where String.fromCharCode breaks
        case 219:
            return "[";
        case 221:
            return "]";
        default:
            return String.fromCharCode(code);
    }
};

var keyToFrequency = function(key){

    var keyRow = "QWERTYUIOP[]";
    var keyNum = keyRow.indexOf(key);
    if (keyNum === -1) {
        return 0;
    }
    // See: https://en.wikipedia.org/wiki/Piano_key_frequencies
    // We're starting at A4
    return Math.pow(2, keyNum / 12.0) * 440;
};