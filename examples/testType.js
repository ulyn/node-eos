var eos = require("node-eos");
var RequestProtocol = eos.RequestProtocol;
var params = eos.params;

var appId = "test";
var serviceId = "testType";
var serviceVersion = "1.3";
function Service(rpcContext){
    this.rpcContext = rpcContext || new params.RpcContext();
}
Service.prototype.testMap = function(map,str,successFunc,errorFunc){
    var req = this._createReqPro(map,str,"testMap");
    eos.call(req,successFunc,errorFunc);
}
create
Service.prototype._createReqPro = function(){
    var method = arguments.pop();
    var req = new RequestProtocol({
        appId:appId,
        serviceId:serviceId,
        serviceVersion:serviceVersion,
        mock:"",
        debugServerIp:"",
        rpcContext:this.rpcContext,
        rpcInvocation:new params.RpcInvocation({
            "@type":"com.sunsharing.eos.common.rpc.impl.RpcInvocation",
            methodName:method,
            parameterTypes:null,
            arguments:arguments,
            mock:""
        })
    });
    return req;
}
module.exports = Service;