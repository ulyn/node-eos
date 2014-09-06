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
function RpcContext(params){
    _.extend(this,defaultRpcContext,params);
}

module.exports = {
    RpcInvocation:RpcInvocation,
    RpcContext:RpcContext
}