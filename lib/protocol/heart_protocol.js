var basePro = require("./base_protocol");
var util = require("util");

function HeartProtocol(){}
util.inherits(HeartProtocol, basePro.BaseProtocol);
HeartProtocol.prototype.action = basePro.HEAD_HEART_BEAT;
HeartProtocol.prototype.createBuffer = function createBuffer(){
    var buff = new Buffer(1);
    buff.write(this.action);
    return buff;
}

function toProtocol(buffer) {
    if (buffer.length < 1) {
        return null;
    }
    var heartPro = new HeartProtocol();
    heartPro.action = buffer.toString("utf-8",0,1);
    heartPro.bodyLength = 0;
    return heartPro;
}

module.exports = {
    HeartProtocol:HeartProtocol,
    toProtocol:toProtocol
}