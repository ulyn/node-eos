var RequestProtocol = require('./protocol/request_protocol').RequestProtocol;
var params = require('./params');

function Service(rpcContext){
    this.appId = "";
    this.serviceId = "";
    this.serviceVersion = "";
    this.rpcContext = rpcContext || new params.RpcContext();
}
Service.prototype._createReqPro = function(){
    var method = arguments[0];
    var args = [];
    if(arguments.length>1){
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
    }
    var req = new RequestProtocol({
        appId:this.appId,
        serviceId:this.serviceId,
        serviceVersion:this.serviceVersion,
        mock:"",
        debugServerIp:"",
        rpcContext:this.rpcContext,
        rpcInvocation:new params.RpcInvocation({
            "@type":"com.sunsharing.eos.common.rpc.impl.RpcInvocation",
            methodName:method,
            parameterTypes:null,
            arguments:args,
            mock:""
        })
    });
    return req;
}
module.exports = Service;