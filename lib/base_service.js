var _ = require('underscore');
var RequestProtocol = require('./protocol/request_protocol').RequestProtocol;
var params = require('./params');
var Exception = require('./exception');

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

/**
 *  执行服务指定方法，入参为key-value形式，方法需要指定参数paramKey，否则抛出异常
 * @param methodName
 * @param paramObject
 */
Service.prototype.doInvoke = function(methodName,paramObject,successFunc,errorFunc){
    var method = this[methodName];
    var paramKey = method.paramKey;
    if(paramKey&& _.isArray(paramKey)){
        var params = [];
        for(var i= 0,l=paramKey.length;i<l;i++){
            var key = paramKey[i];
            params.push(paramObject[key]);
        }
        params.push(successFunc);
        params.push(errorFunc);
        method.apply(this,params);
    }else{
        var tip = "doInvoke error,please set paramKey of method:"+methodName;
        console.error(tip);
        errorFunc && errorFunc(new Exception(Exception.REFLECT_INVOKE_EXCEPTION,tip, this.doInvoke));
    }
}

module.exports = Service;