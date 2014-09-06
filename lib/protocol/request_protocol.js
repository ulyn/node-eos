var basePro = require("./base_protocol");
var util = require("util");
var _ = require('underscore');

var reqDefaultParam =  {
    appId:"",
    serviceId:"",
    serviceVersion:"",
    mock:"",
    debugServerIp:"",
    rpcContext:null,
    invocation:null
}

function RequestProtocol(reqParam){
    var realParam = _.extend({},reqDefaultParam,reqParam);

}
util.inherits(RequestProtocol, basePro.BaseProtocol);
RequestProtocol.prototype.action = basePro.HEAD_REQUEST_MSG;
RequestProtocol.prototype.createBuffer = function createBuffer(){
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