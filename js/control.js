import { Joystick } from './world/system/joystick.js';
import { Gimbal } from './world/components/gimbal.js';
import { Model } from './world/components/model.js';
import { Ray } from './world/system/raycaster.js';
import { Preloader } from './world/system/preload.js';

// 01: Build controller
function Controls() {
    // User viewing modes
    this.introComplete = false; // Tracks intro or main view
    this.modeVR = false; // Uses stereoscopic view
    this.modeOrbit = false; // Uses gyro to orbit camera
    // Device features
    this.deviceTouch = undefined; // Is it a touch device
    this.deviceAccel = false; // Does it have accelerometer data?
    this.zoom = 1;
    TweenLite.defaultEase = Power2.easeInOut;
    this.pageMain = document.getElementById("pageMain");
    this.model = new Model(this.pageMain);
    this.mouseTap = new THREE.Vector2(1000, 1000);
    // Check if it's touch device
    this.hammer = new Hammer(this.pageMain);
    this.refHammerPan = this.rippleTouch.bind(this);
    this.hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL, threshold: 3 });
    this.hammer.on("hammer.input", this.refHammerPan);
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    // Check if it has accelerometer data
    this.accelTestReference = this.acceleromTest.bind(this);
    window.addEventListener("deviceorientation", this.accelTestReference);
    this.ray = new Ray(this.model.monoc.camera);
    this.preload();
}
/////////////////////////////////////// INTRO SEQUENCE ////////////////////////////////////////
// 02: Start asset preload
Controls.prototype.preload = function () {
    var manifesto = [
        // Cube textures
        { name: "envReflection", type: "cubetexture", ext: "jpg" },
        { name: "envSkybox", type: "cubetexture", ext: "jpg" },
        // Car lights
        { name: "flareHead", type: "texture", ext: "jpg" },
        { name: "flareTurn", type: "texture", ext: "jpg" },
        { name: "lightTurn", type: "texture", ext: "jpg" },
        { name: "lightStop", type: "texture", ext: "jpg" },
        // Car geometry
        { name: "vrBodyCompiled", type: "mesh", ext: "json" },
        { name: "vrWheelBrakes", type: "mesh", ext: "json" },
        // Other
        { name: "thread", type: "texture", ext: "jpg" },
        { name: "shadow", type: "texture", ext: "jpg" },
        { name: "icoBtns", type: "texture", ext: "png" },
        { name: "icoCtrls", type: "texture", ext: "png" },
    ];
    var path = "../";
    this.preloader = new Preloader(path, manifesto, this);
    window["preloader"] = this.preloader;
    this.preloader.start();
    this.model.introPreloading();
};
// 03: Preloading has completed, wait for input
Controls.prototype.preloadComplete = function (_cargo) {
    this.model.introPreloaded(_cargo);
    this.introComplete = true;
    // Create tap listener
    this.refHammerTap = this.introAnimation.bind(this);
    this.hammer.on("tap", this.refHammerTap);
};
// 04: Tap received, play intro animation
Controls.prototype.introAnimation = function (evt) {
    // Determines touch device
    if (typeof this.deviceTouch === "undefined") {
        this.hammerCheckTouch(evt);
    }
    // Remove intro hammer listeners
    this.hammer.off("tap", this.refHammerTap);
    this.hammer.off("hammer.input", this.refHammerPan);
    this.model.introStart();
    this.preloader.remove();
    TweenLite.delayedCall(0, this.initControls.bind(this));
};
// 05: Intro animation complete, initiate controls
Controls.prototype.initControls = function (evt) {
    this.joystick = new Joystick();
    this.gimbal = new Gimbal();
    this.initKeyboard();
    this.initButtons();
    this.initHammer();
    // Window events
    this.pageMain.addEventListener("wheel", this.gestureWheel.bind(this));
    window.addEventListener("deviceorientation", this.accelerometerMove.bind(this));
    window.addEventListener("orientationchange", this.onDeviceReorientation.bind(this));
    this.onDeviceReorientation();
    // HUD for mobile		
    this.mobHUDTilt = document.getElementById("mobileHUDTilt");
    this.mobHUDTouch = document.getElementById("mobileHUDTouch");
    // Show on-screen controls
    if (this.deviceTouch === false) {
        var ctrls = document.getElementsByClassName("ctrls");
        for (var i = 0; i < ctrls.length; i++) {
            ctrls[i].style.opacity = "1";
        }
    }
    else {
        this.showHUD();
    }
};
Controls.prototype.showHUD = function () {
    this.mobHUDTilt.style.opacity = "1";
    this.mobHUDTouch.style.opacity = "1";
    TweenLite.delayedCall(3, this.hideHUD.bind(this));
};
Controls.prototype.hideHUD = function () {
    this.mobHUDTilt.style.opacity = "0";
    this.mobHUDTouch.style.opacity = "0";
};
/////////////////////////////////////// HAMMER CONTROLS ////////////////////////////////////////
// Raycasts for ripples
Controls.prototype.rippleTouch = function (evt) {
    if (evt.isFinal === false) {
        this.raycast(evt);
    }
};
// Checks if it's touch or mouse
Controls.prototype.hammerCheckTouch = function (evt) {
    switch (evt.pointerType) {
        case "mouse":
            this.deviceTouch = false;
            break;
        case "touch":
        default:
            this.deviceTouch = true;
            break;
    }
};
Controls.prototype.initHammer = function () {
    if (this.deviceTouch) {
        // Enables pinch & joystick controls
        this.hammer.get("pinch").set({ enable: true });
        this.hammer.on("hammer.input", this.hammerInput.bind(this));
        this.hammer.on("pinchstart", this.hammerPinchStart.bind(this));
        this.hammer.on("pinch", this.hammerPinch.bind(this));
    }
    else {
        // Enables camera orbit controls
        this.hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL, threshold: 1 });
        this.hammer.on("pan", this.hammerPan.bind(this));
    }
};
Controls.prototype.hammerPan = function (event) {
    this.model.cam.orbitBy(event.velocityX, event.velocityY);
};
Controls.prototype.hammerPinchStart = function (event) {
    this.zoom = this.model.cam.distTarget;
};
Controls.prototype.hammerPinch = function (event) {
    this.model.cam.distTarget = this.zoom / event.scale;
};
Controls.prototype.hammerInput = function (event) {
    if (this.modeVR === false) {
        this.model.props.onJoystickMove(this.joystick.gestureInput(event));
    }
};
Controls.prototype.raycast = function (event) {
    this.mouseTap.x = (event.pointers[0].clientX / this.model.vpW) * 2 - 1;
    this.mouseTap.y = (event.pointers[0].clientY / this.model.vpH) * -2 + 1;
    var pos = this.ray.rayCast(this.mouseTap);
    if (typeof pos !== "boolean") {
        this.model.grid.moveRippleOrigin(pos.x, pos.z);
    }
};
/////////////////////////////////////// KEYBOARD CONTROLS ////////////////////////////////////////
Controls.prototype.initKeyboard = function () {
    window.addEventListener("keydown", this.model.props.onKeyDown.bind(this.model.props), false);
    window.addEventListener("keyup", this.model.props.onKeyUp.bind(this.model.props), false);
};
/////////////////////////////////////// VR/FS BUTTON CONTROLS ////////////////////////////////////////
Controls.prototype.initButtons = function () {
    // DOM Buttons
    this.btnVR = document.getElementById("btnVR");
    this.btnVRO = document.getElementById("btnVRO");
    this.btnVREsc = document.getElementById("btnVREsc");
    this.btnEnterF = document.getElementById("btnEnterFull");
    this.btnExitF = document.getElementById("btnExitFull");
    // VR mode only works with accelerometer data
    if (this.deviceAccel) {
        this.modeOrbit = true;
        this.btnVR.style.display = "block";
        this.btnVRO.style.display = "block";
        this.btnVR.addEventListener("click", this.enterVRMode.bind(this));
        this.btnVRO.addEventListener("click", this.enterVROrbitMode.bind(this));
        this.btnVREsc.addEventListener("click", this.exitVRMode.bind(this));
        this.noSleep = new NoSleep();
    }
    // Fullscreen features don't work on iOS devices
    if (!/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
        this.btnEnterF.style.display = "block";
        this.btnExitF.addEventListener("click", this.fullScreenExit.bind(this));
        this.btnEnterF.addEventListener("click", this.fullScreenEnter.bind(this));
        document.addEventListener('fullscreenchange', this.fullScreenChanged.bind(this), false);
        document.addEventListener('MSFullscreenChange', this.fullScreenChanged.bind(this), false);
        document.addEventListener('mozfullscreenchange', this.fullScreenChanged.bind(this), false);
        document.addEventListener('webkitfullscreenchange', this.fullScreenChanged.bind(this), false);
    }
};
Controls.prototype.enterVRMode = function () {
    if (this.modeVR == true) {
        return;
    }
    this.modeVR = true;
    this.modeOrbit = false;
    this.hideHUD();
    this.changedVRMode();
    this.noSleep.enable();
};
Controls.prototype.enterVROrbitMode = function () {
    if (this.modeVR == true) {
        return;
    }
    this.modeVR = true;
    this.modeOrbit = true;
    this.hideHUD();
    this.changedVRMode();
    this.noSleep.enable();
};
Controls.prototype.exitVRMode = function () {
    if (this.modeVR == false) {
        return;
    }
    this.modeVR = false;
    this.modeOrbit = true;
    this.model.props.joyVec.set(0, 0);
    this.changedVRMode();
    this.showHUD();
    this.noSleep.disable();
};
Controls.prototype.changedVRMode = function () {
    // Buttons
    this.btnVR.style.display = this.modeVR ? "none" : "block";
    this.btnVRO.style.display = this.modeVR ? "none" : "block";
    this.btnVREsc.style.display = this.modeVR ? "block" : "none";
    this.model.toggleStereo(this.modeVR, this.modeOrbit);
};
/////////////////////////////////////// FULL SCREEN EVENTS ////////////////////////////////////////
Controls.prototype.fullScreenChanged = function () {
    if (document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement == false) {
        // Entered full screen
        this.btnExitF.style.display = "block";
        this.btnEnterF.style.display = "none";
    }
    else {
        // Exited full screen
        this.btnExitF.style.display = "none";
        this.btnEnterF.style.display = "block";
    }
};
Controls.prototype.fullScreenEnter = function () {
    if (this.pageMain.webkitRequestFullscreen) {
        this.pageMain.webkitRequestFullscreen();
    }
    else if (this.pageMain.mozRequestFullScreen) {
        this.pageMain.mozRequestFullScreen();
    }
    else {
        this.pageMain.requestFullscreen();
    }
};
Controls.prototype.fullScreenExit = function () {
    if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else {
        document.exitFullscreen();
    }
};
/////////////////////////////////////// ACCELEROMETER EVENTS ////////////////////////////////////////
// Tests if accelerometer data is available
Controls.prototype.acceleromTest = function (event) {
    if ((typeof event.alpha != "undefined") && (typeof event.beta != "undefined") && (typeof event.gamma != "undefined")) {
        this.deviceAccel = true;
    }
    window.removeEventListener("deviceorientation", this.accelTestReference);
};
// Device is moved
Controls.prototype.accelerometerMove = function (event) {
    if (this.modeOrbit === true) {
        // Gyro data controls camera
        this.model.cam.onGyroMove(event.alpha, event.beta, event.gamma);
    }
    else {
        // Gyro data controls car commands
        this.gimbal.onGyroMove(event.alpha, event.beta, event.gamma);
        if (Math.abs(this.gimbal.roll) > 5) {
            this.model.props.joyVec.x = THREE.Math.clamp(-this.gimbal.roll / 25, -1, 1);
        }
        else {
            this.model.props.joyVec.x = 0;
        }
        this.model.props.joyVec.y = THREE.Math.clamp((this.gimbal.attack + 20) / 30, -1, 1);
    }
};
/////////////////////////////////////// WINDOW EVENTS ////////////////////////////////////////
// User scrolls down
Controls.prototype.gestureWheel = function (event) {
    // Dolly cam
    switch (event.deltaMode) {
        case 0:
            this.model.cam.dolly(event.deltaY * 0.2);
            break;
        case 1:
            this.model.cam.dolly(event.deltaY * 20);
            break;
        case 2:
            this.model.cam.dolly(event.deltaY * 40);
            break;
    }
};
// Change between portrait/landscape
Controls.prototype.onDeviceReorientation = function () {
    this.model.deviceAngle = 0;
    if (window.orientation) {
        this.model.deviceAngle = parseInt(window.orientation.toString(), 10) * -1;
    }
    this.model.cam.onDeviceReorientation(this.model.deviceAngle);
    this.gimbal.onDeviceReorientation(this.model.deviceAngle);
};
// Browser window resize
Controls.prototype.onWindowResize = function () {
    this.model.onWindowResize();
};
Controls.prototype.update = function (t) {
    if (this.introComplete === false) {
        this.model.updateIntro(t);
    }
    else {
        this.model.update(t, this.modeVR);
    }
};

export { Controls };