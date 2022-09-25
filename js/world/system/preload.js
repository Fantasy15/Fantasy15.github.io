// Takes a manifesto of assets, reports progress, & calls complete
function Preloader(_path, _manifesto, _parent) {
    this.path = _path;
    this.manifesto = _manifesto;
    this.parent = _parent;
    this.assetCount = 0;
    this.assetTotal = _manifesto.length;
    this.loaderText = new THREE.TextureLoader();
    this.loaderMesh = new THREE.ObjectLoader();
    this.loaderCube = new THREE.CubeTextureLoader();
    this.cargo = {};
    this.container = document.getElementById("preloader");
    this.progBar = document.getElementById("preProg");
    this.detailBox = document.getElementById("preDetail");
}
Preloader.prototype.start = function () {
    this.container.className = "visible";
    this.detailBox.innerHTML = translations["LOADING_ASSETS"];
    var ext;
    var _loop_1 = function (i) {
        ext = "." + this_1.manifesto[i].ext;
        switch (this_1.manifesto[i].type) {
            case "texture":
                this_1.loaderText.load(
                    this_1.path + "textures/" + this_1.manifesto[i].name + ext, 
                    function (_obj) { this.assetAquired(_obj, this.manifesto[i].name); }.bind(this_1), 
                    undefined, 
                    function (_err) { this.assetFailed(_err, this.manifesto[i].name); }.bind(this_1)
                );
                break;
            case "mesh":
                this_1.loaderMesh.load(
                    this_1.path + "meshes/" + this_1.manifesto[i].name + ".json", 
                    function (_obj) { this.assetAquired(_obj, this.manifesto[i].name); }.bind(this_1), 
                    undefined, 
                    function (_err) { this.assetFailed(_err, this.manifesto[i].name); }.bind(this_1)
                );
                break;
            case "cubetexture":
                this_1.loaderCube.setPath(this_1.path + "textures/" + this_1.manifesto[i].name + "/");
                this_1.loaderCube.load(
                    ["xp" + ext, "xn" + ext, "yp" + ext, "yn" + ext, "zp" + ext, "zn" + ext], 
                    function (_obj) { this.assetAquired(_obj, this.manifesto[i].name); }.bind(this_1), 
                    undefined, 
                    function (_err) { this.assetFailed(_err, this.manifesto[i].name); }.bind(this_1)
                );
                break;
        }
    };
    var this_1 = this;
    for (var i = 0; i < this.assetTotal; i++) {
        _loop_1(i);
    }
};
Preloader.prototype.assetAquired = function (_obj, _name) {
    this.cargo[_name] = _obj;
    this.assetCount++;
    this.pct = this.assetCount / this.assetTotal;
    this.progBar.style.width = (this.pct * 100) + "%";
    if (this.assetCount == this.assetTotal) {
        this.complete();
    }
};
Preloader.prototype.assetFailed = function (_err, _name) {
    this.assetCount++;
    this.pct = this.assetCount / this.assetTotal;
    if (this.assetCount == this.assetTotal) {
        this.complete();
    }
};
Preloader.prototype.complete = function () {
    this.detailBox.innerHTML = translations["BUILDING_CAR"];
    TweenLite.delayedCall(0.5, function () {
        this.parent.preloadComplete(this.cargo);
        this.detailBox.innerHTML = translations["TAP_TO_BEGIN"];
    }.bind(this));
};
Preloader.prototype.remove = function () {
    this.container.className = "";
};

export { Preloader };