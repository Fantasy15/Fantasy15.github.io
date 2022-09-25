import { 
    noWebGL,
    detectWebGL,
    browserCheck
} from './world/util/check.js';

import {Controls} from './control.js';
// Scene vars
var control;

///////////////////////////// SCENE SETUP /////////////////////////////

if (detectWebGL() && browserCheck()) {
    initApp();
}
else {
    noWebGL();
}

function initApp() {
    control = new Controls();
    render(0);
}
function render(t) {
    control.update(t * 0.001);
    requestAnimationFrame(render);
}
