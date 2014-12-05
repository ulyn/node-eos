var _ = require('underscore');

var defaultRpcInvocation  = {
    methodName:"",
    parameterTypes:null,
    arguments:[],
    mock:""
}
var defaultRpcContext  = {
    remoteAddr:"",
    userAgent : "node_eos_client",
    attributeMap :{}
}
function RpcInvocation(params){
    _.extend(this,defaultRpcInvocation,params);
}
RpcInvocation.prototype.toJSONString = function(){
    return JSON.stringify(this);
}
function RpcContext(params){
    _.extend(this,defaultRpcContext,params);
}
RpcContext.prototype.toJSONString = function(){
    var json = {
        remoteAddr:this.remoteAddr,
        userAgent:this.userAgent,
        attributeMap:this.attributeMap
    }
    return JSON.stringify(json);
}
module.exports = {
    RpcInvocation:RpcInvocation,
    RpcContext:RpcContext
}