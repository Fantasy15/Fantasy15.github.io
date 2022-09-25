// var rawVert = __webpack_require__(16);
// var hmFrag = __webpack_require__(15);
import { rawVert } from "./rawVert.js";
import { hmFrag } from "./hmFrag.js";
var RippleGen = /** @class */ (function () {
    function RippleGen(_renderer, mouse, _gridSize) {
        if (_gridSize === void 0) { _gridSize = 64; }
        this.renderChange = false;
        // DevScene
        this.devMode = false;
        // Set up renderers
        this.renderer = _renderer;
        this.textureSize = _gridSize;
        var dataType = (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? THREE.HalfFloatType : THREE.FloatType;
        this.rTarget1 = new THREE.WebGLRenderTarget(this.textureSize, this.textureSize, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            stencilBuffer: false,
            depthBuffer: false,
            format: THREE.RGBAFormat,
            type: dataType,
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping
        });
        this.rTarget2 = this.rTarget1.clone();
        // Set up GP scene
        this.gpScene = new THREE.Scene();
        this.gpCam = new THREE.Camera();
        this.gpCam.position.z = 1;
        var rezString = "vec2( " + this.textureSize.toFixed(1) + ", " + this.textureSize.toFixed(1) + " )";
        this.gpGeom = new THREE.PlaneBufferGeometry(2, 2);
        this.gpMat = new THREE.RawShaderMaterial({
            uniforms: {
                ripplePos: { value: mouse },
                rippleSize: { value: 1.0 },
                rippleImpact: { value: 1.0 },
                viscosity: { value: 0.01 },
                heightmap: { value: null }
            },
            defines: {
                BOUNDS: this.textureSize.toFixed(1),
                resolution: rezString
            },
            vertexShader: rawVert,
            fragmentShader: hmFrag,
            depthWrite: false,
        });
        this.uniSize = this.gpMat.uniforms["rippleSize"];
        this.uniImpact = this.gpMat.uniforms["rippleImpact"];
        this.gpMesh = new THREE.Mesh(this.gpGeom, this.gpMat);
        this.gpScene.add(this.gpMesh);
        // Set up dev view
        if (this.devMode) {
            this.devScene = new THREE.Scene();
            this.devCam = new THREE.Camera();
            this.devCam.position.z = 1;
            this.devGeom = new THREE.PlaneBufferGeometry(2, 2);
            this.devMat = new THREE.MeshBasicMaterial({ map: this.rTarget1.texture });
            this.devMesh = new THREE.Mesh(this.devGeom, this.devMat);
            this.devScene.add(this.devMesh);
        }
    }
    RippleGen.prototype.newRippleSize = function (_size) {
        this.uniSize.value = _size;
    };
    RippleGen.prototype.newRippleImpact = function (_val) {
        this.uniImpact.value = _val;
    };
    RippleGen.prototype.update = function () {
        this.renderChange = !this.renderChange;
        // Render target 1
        if (this.renderChange) {
            this.gpMat.uniforms["heightmap"].value = this.rTarget2.texture;
            this.renderer.render(this.gpScene, this.gpCam, this.rTarget1);
            if (this.devMode) {
                this.renderer.setViewport(0, 0, this.textureSize * 2, this.textureSize * 2);
                this.renderer.render(this.devScene, this.devCam);
                this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            }
            return this.rTarget1.texture;
        }
        else {
            this.gpMat.uniforms["heightmap"].value = this.rTarget1.texture;
            this.renderer.render(this.gpScene, this.gpCam, this.rTarget2);
            if (this.devMode) {
                this.renderer.setViewport(0, 0, this.textureSize * 2, this.textureSize * 2);
                this.renderer.render(this.devScene, this.devCam);
                this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            }
            return this.rTarget2.texture;
        }
    };
    return RippleGen;
}());
export {RippleGen};