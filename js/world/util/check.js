function noWebGL() {
    document.getElementById("preloader").className = "visible";
    document.getElementById("preLogo").style.display = "block";
    document.getElementById("preButton").style.display = "block";
    document.getElementById("preDetail").innerHTML = translations["BROWSER_BAD"];
}

function browserCheck() {
    return !navigator.userAgent.match(/UCBrowser/);
}

function detectWebGL() {
    try {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        window["EXT_STLOD_SUPPORT"] = context.getExtension("EXT_shader_texture_lod") ? true : false;
        return !!(window.WebGLRenderingContext && context);
    }
    catch (e) {
        return false;
    }
}

export {
    noWebGL,
    browserCheck,
    detectWebGL
}