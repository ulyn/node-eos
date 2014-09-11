var eos = require("../lib/eos");
var RequestProtocol = require('../lib/protocol/request_protocol').RequestProtocol;
var params = require('../lib/params');

var appId = "test";
var serviceId = "testType";
var serviceVersion = "1.3";
function Service(rpcContext){
    this.rpcContext = rpcContext || new params.RpcContext();
}
Service.prototype.testMap = function(map,str,successFunc,errorFunc){
    var req = this._createReqPro("testMap",map,str);
    eos.call(req,successFunc,errorFunc);
}

Service.prototype._createReqPro = function(){
    var args = arguments;
    var req = new RequestProtocol({
        appId:appId,
        serviceId:serviceId,
        serviceVersion:serviceVersion,
        mock:"",
        debugServerIp:"",
        rpcContext:this.rpcContext,
        rpcInvocation:new params.RpcInvocation({
            "@type":"com.sunsharing.eos.common.rpc.impl.RpcInvocation",
            methodName:"testMap",
            parameterTypes:null,
            arguments:[map,str],
            mock:""
        })
    });
    return req;
}
module.exports = Service;