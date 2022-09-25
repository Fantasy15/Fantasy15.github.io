// Tween to target using Zeno's Paradox
function zTween(_val, _target, _ratio) {
    return _val + (_target - _val) * Math.min(_ratio, 1.0);
}
export { zTween }