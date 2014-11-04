var basePro = require("./base_protocol");
var util = require("util");
var _ = require('underscore');
var Exception = require('../exception');

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
ResponseProtocol.prototype.callback = function(req,success,error){
    if(this.status == "0"){
        var value = this.result.value;
        if(req.mock){
            try{
                value = JSON.parse(value);
            }catch (e){
                //can't parse ,skip...
                console.log("can't json parse ,skip ...");
            }
        }
        success && success(value);
    }else{
        error && error(this.result.exception);
    }
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
    if(responsePro.status != "0"){
        //has exception,create result exception;
        var ex;
        if(responsePro.result){
            if(responsePro.result.exception){
                ex = Exception.create(Exception.REMOTE_SERVER_EXCEPTION,
                    responsePro.result.exception.message || responsePro.result.exception.detailMessage);
            }else{
                ex = Exception.create(Exception.UNKNOWN_EXCEPTION,"status is 0 but return responsePro.result.exception is undefined");
            }
        }else{
            ex = Exception.create(Exception.UNKNOWN_EXCEPTION,"ResponsePro.result is undefined,Maybe the server version of EOS is old ! ");
        }
        responsePro.result.exception = ex;
    }
    return responsePro;
}

module.exports = {
    ResponseProtocol:ResponseProtocol,
    toProtocol:toProtocol
}