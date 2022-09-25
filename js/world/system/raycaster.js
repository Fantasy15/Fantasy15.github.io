// Creates a plane that receives mouse clicks and returns a Vec3 of where it took place.
var Ray = /** @class */ (function () {
    function Ray(_cam) {
        this.cam = _cam;
        this.ray = new THREE.Raycaster();
        this.geom = new THREE.PlaneBufferGeometry(64, 64);
        this.geom.rotateX(-Math.PI / 2);
        // this.geom.translate(0, 0, 50);
        this.mat = new THREE.MeshStandardMaterial();
        this.plane = new THREE.Mesh(this.geom, this.mat);
    }
    // Moves pane to look at camera, then returns position, or false
    Ray.prototype.rayCast = function (mouse) {
        this.ray.setFromCamera(mouse, this.cam);
        var intersects = this.ray.intersectObject(this.plane);
        if (typeof intersects[0] !== "undefined") {
            return intersects[0].point;
        }
        else {
            return false;
        }
    };
    return Ray;
}());
export { Ray };