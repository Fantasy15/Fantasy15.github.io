// Keeps track of time in seconds
// and caps rendering to match desired FPS

function Time(timeFactor) {
    this.fallBackRates = [60, 40, 30, 20, 15];
    this.prev = 0;
    this.prevBreak = 0;
    this.delta = 0;
    this.timeFact = (typeof timeFactor === "undefined") ? 1 : timeFactor;
    this.frameCount = 0;
    this.fallBackIndex = 0;
    this.setFPS(60);
}

Time.prototype.update = function (_newTime) {
    this.deltaBreak = Math.min(_newTime - this.prevBreak, 1.0);
    // Update time if enough time has passed
    if (this.deltaBreak > this.spf) {
        this.delta = Math.min(_newTime - this.prev, 1.0);
        this.prev = _newTime;
        this.prevBreak = _newTime - (this.deltaBreak % this.spf);
        // this.checkFPS();
        // Returns true to render frame
        return true;
    }
    else {
        // Returns false to skip frame
        return false;
    }
};

Time.prototype.checkFPS = function () {
    if (this.delta > this.spf * 2) {
        this.frameCount++;
        console.log(this.frameCount);
        if (this.frameCount > 30) {
            this.frameCount = 0;
            this.fallBackIndex++;
            this.setFPS(this.fallBackRates[this.fallBackIndex]);
        }
    }
};

Time.prototype.setFPS = function (_newVal) {
    this.fps = _newVal;
    this.spf = 1 / this.fps;
};

export {Time};