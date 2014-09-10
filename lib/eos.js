var _ = require('underscore');
var client = require('./net/client');
var serviceLocation = require('./zookeeper/service_location');

var config = {
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    long_connect: true,
    exclude_eos:[],//ignore eos
    debugging_server_ip: '', //联调服务端ip
    use_mock: false, //全局控制是否使用mock
    method_mock: {
        "appid":{
            "testService":["sayHello"]
        }
    },
    advice:{
        "appid":{
            "testService":["sayHello"]
        }
    }
};
var serviceHelper = null;
function init(opts){
    if(serviceHelper!=null){
        console.log("eos has init !");
        return;
    }
    _.extend(config,opts);
    serviceHelper = serviceLocation.createServiceLocation(config.zookeeper_ip,config.zookeeper_port,config.exclude_eos);
    serviceHelper.connect();

}
function call(req,success,error){
    if (!config.use_mock) {
        req.mock = "";
    }
    var isMock = !_.isEmpty(req.mock);
    var ipPort = null;
    if(isMock){
        ipPort = serviceHelper.getOnlineEOS();
    }else{
        ipPort = serviceHelper.getServiceLocation(req.appId, req.serviceId, req.serviceVersion);
    }
    if (ipPort == null) {
        if (isMock) {
            var errorMsg = "对于模拟调用，没有找到可用的eos,请确保服务" + req.appId + "-"
                + req.serviceId + "-"
                + req.serviceVersion + "是否有效或者eos节点已经启动！";
            console.error(errorMsg);
            error && error(errorMsg);
        } else {
            errorMsg = "没有找到请求的可用的eos节点,请确保服务" + req.appId + "-"
                + req.serviceId + "-"
                + req.serviceVersion + "是否有效或者eos节点已经启动！";
            console.error(errorMsg);
            error && error(errorMsg);
        }
        return;
    }

    var rpcClient = client.get({
        ip:ipPort.ip,
        port:ipPort.port,
        isLong:config.long_connect
    });
    rpcClient.doRpc(req,function(responsePro){
            //取得结果返回
            if(responsePro.status == "0"){
                success && success(responsePro.result.value);
            }else{
                error && error(responsePro.result.exception.detailMessage);
            }
        },function(err){
            //连接异常等
            console.log("请求异常",err);
            error && error(responsePro.result);
        }
    );
//    var req = new RequestProtocol({
//        appId:"test",
//        serviceId:"testType",
//        serviceVersion:"1.3",
//        mock:"",
//        debugServerIp:"",
//        rpcContext:new params.RpcContext(),
//        rpcInvocation:new params.RpcInvocation({
//            "@type":"com.sunsharing.eos.common.rpc.impl.RpcInvocation",
//            methodName:"testMap",
//            parameterTypes:null,
//            arguments:[{"@type":"java.util.HashMap",a:1},"2"],
//            mock:""
//        })
//    });
//    console.log("create message："+req.msgId);

}

module.exports = {
    init : init,
    call : call
}