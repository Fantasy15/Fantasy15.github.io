// Converts a value to 0 - 1 from its min - max bounds
function normalize(val, min, max) {
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
}
// Converts a value to 0 - 1 from its min - max bounds in quadratic in form
function normalizeQuadIn(val, min, max) {
    return Math.pow(normalize(val, min, max), 2.0);
}
// Converts a value to 0 - 1 from its min - max bounds in quadratic out form
function normalizeQuadOut(val, min, max) {
    var x = normalize(val, min, max);
    return x * (2.0 - x);
}

export {
    normalize,
    normalizeQuadIn,
    normalizeQuadOut,
}