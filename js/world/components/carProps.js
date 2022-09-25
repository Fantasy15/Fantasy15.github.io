import { Time, normalizeQuadIn, zTween } from '../util/index.js';
// FF 91 Constants
function FF91() {
}
FF91.Accel = 5; // m/s^2
FF91.Decel = -10; // m/s^2
FF91.MaxVel = (70 * 1610) / 3600; // 70m/h ~= 31.3m/s
FF91.MaxTurn = Math.PI * 0.20; // Max angle of wheel turn
// Dimensions
FF91.Length = 5.250; // Car length
FF91.Width = 2.283; // Car width
FF91.WheelTrack = 1.72; // Wheel track
FF91.WheelBase = 3.200; // Wheel base
FF91.WheelDiam = 0.780; // Wheel diameter
FF91.WheelCirc = FF91.WheelDiam * Math.PI; // Wheel circumference

function CarProps() {
    this.time = new Time();
    this.velocity = new THREE.Vector2();
    this.speed = 0;
    this.accel = 0;
    this.pos = new THREE.Vector2();
    this.joyVec = new THREE.Vector2();
    // Momentim
    this.longitMomentum = 0;
    this.lateralMomentum = 0;
    this.wAngleInner = 0;
    this.wAngleOuter = 0;
    this.wAngleTarg = 0;
    this.keys = new Array();
    this.braking = 0.0;
    this.omega = 0;
    this.theta = -Math.PI / 2;
}
CarProps.prototype.onKeyDown = function (evt) {
    // Add key to list if they don't exist yet
    if (this.keys.indexOf(evt.key) === -1) {
        this.keys.push(evt.key);
    }
};
CarProps.prototype.onKeyUp = function (evt) {
    //Otherwise, remove from keys list
    this.keys.splice(this.keys.indexOf(evt.key), 1);
};
CarProps.prototype.readKeyboardInput = function () {
    for (var i = 0; i < this.keys.length; i++) {
        switch (this.keys[i].toLowerCase()) {
            case 'arrowup':// Up
            case 'w':
                this.accel += FF91.Accel;
                // Simulate wind resistance as we reach top speed
                this.accel *= normalizeQuadIn(this.speed, FF91.MaxVel, FF91.MaxVel - 10);
                break;
            case 'arrowdown':// Down
            case 's':
                this.accel += FF91.Decel;
                this.braking = 1;
                break;
            case 'arrowleft':// Left
            case 'a':
                this.wAngleTarg += FF91.MaxTurn;
                break;
            case 'arrowright':// Right
            case 'd':
                this.wAngleTarg -= FF91.MaxTurn;
                break;
        }
    }
};
/////////////////////////////// JOYSTICK EVENTS ///////////////////////////////
CarProps.prototype.onJoystickMove = function (_vec) {
    this.joyVec.x = _vec.x / -40;
    this.joyVec.y = _vec.y / -40;
    if (Math.abs(this.joyVec.x) > 0.85) {
        this.joyVec.y = 0;
    }
    if (Math.abs(this.joyVec.y) > 0.95) {
        this.joyVec.x = 0;
    }
};
CarProps.prototype.readJoyStickInput = function () {
    this.wAngleTarg = this.joyVec.x * FF91.MaxTurn;
    //Accelerating
    if (this.joyVec.y >= 0) {
        this.accel = this.joyVec.y * FF91.Accel;
        // Simulate wind resistance as we reach top speed
        this.accel *= normalizeQuadIn(this.speed, FF91.MaxVel, FF91.MaxVel - 10);
        this.braking = 0;
    }
    else {
        this.accel = this.joyVec.y * -FF91.Decel;
        this.braking = 1;
    }
};
/////////////////////////////// UPDATE ///////////////////////////////
CarProps.prototype.update = function (_time) {
    // Update time, skips according to FPS
    if (this.time.update(_time) === false) {
        return false;
    }
    this.accel = 0;
    this.braking = 0;
    this.wAngleTarg = 0;
    if (this.keys.length > 0) {
        this.readKeyboardInput();
    }
    else if (this.joyVec.x != 0 || this.joyVec.y != 0) {
        this.readJoyStickInput();
    }
    ///////////////// PHYSICS, YO! /////////////////
    this.accel *= this.time.delta;
    this.speed += this.accel;
    if (this.speed < 0) {
        this.speed = 0;
        this.accel = 0;
    }
    this.frameDist = this.speed * this.time.delta;
    // Limit turn angle as speed increases
    this.wAngleTarg *= normalizeQuadIn(this.speed, FF91.MaxVel + 10.0, 3.0);
    this.wAngleInner = zTween(this.wAngleInner, this.wAngleTarg, this.time.delta * 2);
    this.wAngleSign = this.wAngleInner > 0.001 ? 1 : this.wAngleInner < -0.001 ? -1 : 0;
    // Theta is based on speed, wheelbase & wheel angle
    this.omega = this.wAngleInner * this.speed / FF91.WheelBase;
    this.theta += this.omega * this.time.delta;
    // Calc this frame's XY velocity
    this.velocity.set(Math.cos(this.theta) * this.frameDist, -Math.sin(this.theta) * this.frameDist);
    // Add velocity to total position
    this.pos.add(this.velocity);
    // Fake some momentum
    this.longitMomentum = zTween(this.longitMomentum, this.accel / this.time.delta, this.time.delta * 6);
    this.lateralMomentum = this.omega * this.speed;
    if (this.wAngleSign) {
        // Calculate 4 wheel turning radius if angle
        this.radFrontIn = FF91.WheelBase / Math.sin(this.wAngleInner);
        this.radBackIn = FF91.WheelBase / Math.tan(this.wAngleInner);
        this.radBackOut = this.radBackIn + (FF91.WheelTrack * this.wAngleSign);
        this.wAngleOuter = Math.atan(FF91.WheelBase / this.radBackOut);
        this.radFrontOut = FF91.WheelBase / Math.sin(this.wAngleOuter);
    }
    else {
        // Otherwise, just assign a very large radius.
        this.radFrontOut = 100;
        this.radBackOut = 100;
        this.radBackIn = 100;
        this.radFrontIn = 100;
        this.wAngleOuter = 0;
    }
    return true;
};
export { CarProps, FF91 };