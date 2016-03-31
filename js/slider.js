// Oscillator 1
var vol1 = document.getElementById('vol1');
noUiSlider.create(vol1, {
    start: 0.5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 1
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var phase1 = document.getElementById('phase1');
noUiSlider.create(phase1, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 360
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var pan1 = document.getElementById('pan1');
noUiSlider.create(pan1, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': -1,
        'max': 1
    },
    pips: {
        // use other js to change top to be L and bottom to be R
        mode: 'range',
        density: 10
    }
});

// Oscillator 2
var vol2 = document.getElementById('vol2');
noUiSlider.create(vol2, {
    start: 0.5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 1
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var phase2 = document.getElementById('phase2');
noUiSlider.create(phase2, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 360
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var pan2 = document.getElementById('pan2');
noUiSlider.create(pan2, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': -1,
        'max': 1
    },
    pips: {
        // use other js to change top to be L and bottom to be R
        mode: 'range',
        density: 10
    }
});

// ADSR 1
var attack1 = document.getElementById('attack1');
noUiSlider.create(attack1, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 2
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var decay1 = document.getElementById('decay1');
noUiSlider.create(decay1, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 2
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var sustain1 = document.getElementById('sustain1');
noUiSlider.create(sustain1, {
    start: 0.5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 1
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var release1 = document.getElementById('release1');
noUiSlider.create(release1, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 2
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

// ADSR 2
var attack2 = document.getElementById('attack2');
noUiSlider.create(attack2, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 2
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var decay2 = document.getElementById('decay2');
noUiSlider.create(decay2, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 2
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var sustain2 = document.getElementById('sustain2');
noUiSlider.create(sustain2, {
    start: 0.5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 1
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var release2 = document.getElementById('release2');
noUiSlider.create(release2, {
    start: 0,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 2
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

// LFO 1
var lfo1_rate = document.getElementById('lfo1-rate');
noUiSlider.create(lfo1_rate, {
    start: 5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 10
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var lfo1_gain = document.getElementById('lfo1-gain');
noUiSlider.create(lfo1_gain, {
    start: 0.25,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 1
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

// LFO 2
var lfo2_rate = document.getElementById('lfo2-rate');
noUiSlider.create(lfo2_rate, {
    start: 5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 10
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

var lfo2_gain = document.getElementById('lfo2-gain');
noUiSlider.create(lfo2_gain, {
    start: 0.25,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 1
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

// Filter 1
var filter1_frequency = document.getElementById('filter1-frequency');
noUiSlider.create(filter1_frequency, {
    start: 5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 50
    },
    pips: {
        mode: 'range',
        density: 10
    }
});

// Filter 2
var filter2_frequency = document.getElementById('filter2-frequency');
noUiSlider.create(filter2_frequency, {
    start: 5,
    orientation: 'vertical',
    range: {
        'min': 0,
        'max': 50
    },
    pips: {
        mode: 'range',
        density: 10
    }
});