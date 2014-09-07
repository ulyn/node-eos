var basePro = require("./base_protocol");
var util = require("util");
var _ = require('underscore');
var params = require('../params');

var reqDefaultParam =  {
    appId:"",
    serviceId:"",
    serviceVersion:"",
    mock:"",
    debugServerIp:"",
    rpcContext:new params.RpcContext(),
    rpcInvocation:new params.RpcInvocation()
}

function RequestProtocol(reqParam){
    _.extend(this,reqDefaultParam,reqParam);
    basePro.BaseProtocol.call(this);
}
util.inherits(RequestProtocol, basePro.BaseProtocol);
RequestProtocol.prototype.action = basePro.HEAD_REQUEST_MSG;
RequestProtocol.prototype.createBuffer = function createBuffer(){
    var invJsonStr = JSON.stringify(this.rpcInvocation);
    var inv = new Buffer(invJsonStr);
    var header = this.getHeaderBuff(inv.length);

    var subHeader = new Buffer(102);
    subHeader.fill();
    subHeader.write(this.appId,0,32);
    subHeader.write(this.serviceId,32,20);
    subHeader.write(this.serviceVersion,52,10);
    subHeader.write(this.mock,62,20);
    subHeader.write(this.debugServerIp,82,20);

    var rpcContextJsonStr = JSON.stringify(this.rpcContext);
    var rpcContextBuff = new Buffer(rpcContextJsonStr);
    var rpcContextLenBuff = new Buffer(4);
    rpcContextLenBuff.writeInt32BE(rpcContextBuff.length,0,true);
    return Buffer.concat([header,subHeader,rpcContextLenBuff,rpcContextBuff,inv]);
}

function toProtocol(buffer) {
    //The client does not need to implement , return null
    return null;
}

module.exports = {
    RequestProtocol:RequestProtocol,
    toProtocol:toProtocol
}