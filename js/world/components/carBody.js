import { CarWheels } from "./carWheels.js";
import { CarLights } from "./carLights.js";
/*
***** Car hierarchy *****
CarWhole
./carLights.js── wheelFR
├── wheelBL
├── wheelBR
├── CarChassis
    ├── BodyBlack
    ├── BodySilver
    ├── Brakes
    ├── FFBack
    ├── GlassTinted
    ├── GlassTransparent
    ├── Headlights
    ├── Taillights
    └── Undercarriage
 
For lens flare, look into:
https://alteredqualia.com/three/examples/webgl_city.html
*/
function CarBody(_scene, _cargo) {
    console.log(_cargo);
    this.parent = _scene;
    this.carWhole = new THREE.Group();
    this.carWhole.rotateY(-Math.PI / 2);
    this.parent.add(this.carWhole);
    this.carChassis = this.buildCarChassis(_cargo["vrBodyCompiled"], _cargo["envReflection"]);
    this.carWhole.add(this.carChassis);
    this.addShadow(_cargo["shadow"]);
    this.carLights = new CarLights(this.carChassis, _cargo);
    this.carWheels = new CarWheels(this.carWhole, _cargo);
}
// Creates black part of body
CarBody.prototype.buildCarChassis = function (_bodyGeom, _cubeText) {
    _bodyGeom.scale.set(0.0005, 0.0005, 0.0005);
    _bodyGeom.position.set(1.56, 0, 0);
    this.envCube = _cubeText;
    this.envCube.format = THREE.RGBFormat;
    // Material Body Color
    this.matBodySilver = new THREE.MeshStandardMaterial({
        color: 0xbbbbbb,
        metalness: 0.7,
        roughness: 0.7,
        envMap: this.envCube,
    });
    // Workaround for browsers without Texture LevelOfDetail support
    if (window["EXT_STLOD_SUPPORT"] === false) {
        this.envCube.minFilter = THREE.LinearFilter;
        this.matBodySilver.metalness = 0.05;
        this.matBodySilver.roughness = 0.8;
        this.matBodySilver.color = new THREE.Color(0x777777);
    }
    // Material Body Black
    this.matBodyBlack = new THREE.MeshLambertMaterial({
        color: 0x000000,
        emissive: 0x444444,
        reflectivity: 0.8,
        envMap: this.envCube,
    });
    // Tinted windows
    this.matGlassTinted = new THREE.MeshLambertMaterial({
        color: 0x000000,
        emissive: 0x666666,
        reflectivity: 1,
        envMap: this.envCube,
    });
    this.matUndercarriage = new THREE.MeshBasicMaterial({
        color: 0x000000
    });
    // Transparent glass
    this.matGlassTransp = new THREE.MeshLambertMaterial({
        color: 0x000000,
        emissive: 0x666666,
        reflectivity: 1.0,
        envMap: this.envCube,
        transparent: true,
        blending: THREE.AdditiveBlending,
    });
    // Car bodymaterials
    _bodyGeom.getObjectByName("BodyBlack").material = this.matBodyBlack;
    _bodyGeom.getObjectByName("BodySilver").material = this.matBodySilver;
    _bodyGeom.getObjectByName("GlassTransparent").material = this.matGlassTransp;
    _bodyGeom.getObjectByName("GlassTinted").material = this.matGlassTinted;
    _bodyGeom.getObjectByName("Undercarriage").material = this.matUndercarriage;
    return _bodyGeom;
};
CarBody.prototype.addShadow = function (_shad) {
    var shadowPlane = new THREE.PlaneBufferGeometry(6.5, 6.5, 1, 1);
    shadowPlane.rotateX(-Math.PI / 2);
    shadowPlane.translate(1.56, 0, 0);
    var shadowMat = new THREE.MeshBasicMaterial({
        map: _shad,
        side: THREE.DoubleSide,
        blending: THREE.MultiplyBlending,
        transparent: true,
        depthWrite: false
    });
    var shadowMesh = new THREE.Mesh(shadowPlane, shadowMat);
    this.carWhole.add(shadowMesh);
};
///////////////////////////// PUBLIC METHODS /////////////////////////////
CarBody.prototype.onWindowResize = function (_vpH) {
    this.carLights.onWindowResize(_vpH);
};
// Called once per frame
CarBody.prototype.update = function (_props) {
    // Apply car physics
    this.carWhole.rotation.y = _props.theta;
    this.carChassis.rotation.z = _props.longitMomentum * 0.0015;
    this.carChassis.rotation.x = _props.lateralMomentum * 0.002;
    this.carWheels.update(_props);
    this.carLights.update(_props);
};
export { CarBody };