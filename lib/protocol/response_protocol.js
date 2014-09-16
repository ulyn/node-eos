var basePro = require("./base_protocol");
var util = require("util");
var _ = require('underscore');

function ResponseProtocol(){
//    basePro.BaseProtocol.call(this);
    this.status = "1";
    this.result = "";
}
util.inherits(ResponseProtocol, basePro.BaseProtocol);
ResponseProtocol.prototype.action = basePro.HEAD_REQUEST_RESULT;
ResponseProtocol.prototype.createBuffer = function createBuffer(){
    //The client does not need to implement , return null
    return null;
}

function toProtocol(buffer) {
    var len = buffer.length;
    if (len < 53) {
        return null;
    }
    var responsePro = new ResponseProtocol();
    responsePro.setHeader(responsePro, buffer);
    if (len < 53 + responsePro.bodyLength) {
        return null;
    }
    responsePro.status = buffer[52];
    var result = buffer.toString("utf8",53,53 + responsePro.bodyLength);
    if(!_.isEmpty(result)){
        try{
            responsePro.result = JSON.parse(result);
        }catch (e){
            console.error("parse json exception",result);
            eval("responsePro.result = "+result+";");
        }
    }
    return responsePro;
}

module.exports = {
    ResponseProtocol:ResponseProtocol,
    toProtocol:toProtocol
}