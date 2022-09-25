function Joystick() {
    this.visible = false;
    this.posStart = new THREE.Vector2();
    this.posNow = new THREE.Vector2();
    this.circleIn = document.getElementById("joyIn");
    this.circleOut = document.getElementById("joyOut");
}
Joystick.prototype.gestureInput = function (event) {
    if (event.pointers.length === 1) {
        switch (event.eventType) {
            case 1:
                this.touchStart(event.pointers[0].clientX, event.pointers[0].clientY);
                break;
            case 2:
                this.touchMove(event.pointers[0].clientX, event.pointers[0].clientY);
                break;
            case 4:
                this.touchEnd();
                break;
        }
    }
    else {
        // Hides if more than one pointer
        this.touchEnd();
    }
    return this.posNow;
};
// Displays SVG elements upon first touch
Joystick.prototype.touchStart = function (_pX, _pY) {
    this.visible = true;
    this.circleIn.style.display = "block";
    this.circleIn.style.top = _pY + "px";
    this.circleIn.style.left = _pX + "px";
    this.circleOut.style.display = "block";
    this.circleOut.style.top = _pY + "px";
    this.circleOut.style.left = _pX + "px";
    this.posStart.set(_pX, _pY);
};
// Moves joystick upon moving after first touch
Joystick.prototype.touchMove = function (_pX, _pY) {
    if (this.visible === false) {
        this.touchStart(_pX, _pY);
    }
    this.posNow.set(_pX - this.posStart.x, _pY - this.posStart.y);
    this.posNow.clampLength(0, 40);
    this.circleIn.style.transform = "translate(" +
        (this.posNow.x - 34) + "px, " +
        (this.posNow.y - 34) + "px)";
};
// Hides joystick after last touch
Joystick.prototype.touchEnd = function () {
    this.circleIn.style.display = "none";
    this.circleOut.style.display = "none";
    this.circleIn.style.transform = "translate(-34px, -34px)";
    this.posNow.set(0, 0);
    this.visible = false;
};
export { Joystick };