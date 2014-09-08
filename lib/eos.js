var connection = require('./net/connection');
var RequestProtocol = require('./protocol/request_protocol').RequestProtocol;
var basePro = require('./protocol/base_protocol');
var params = require('./params');
var client = require('./net/client');
var DEFAULTS = {
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    debugging_server_ip: '', //联调服务端ip
    use_mock: false //全局控制是否使用mock
};
function send(){
    var req = new RequestProtocol({
        appId:"test",
        serviceId:"testType",
        serviceVersion:"1.3",
        mock:"",
        debugServerIp:"",
        rpcContext:new params.RpcContext(),
        rpcInvocation:new params.RpcInvocation({
            "@type":"com.sunsharing.eos.common.rpc.impl.RpcInvocation",
            methodName:"testMap",
            parameterTypes:null,
            arguments:[{"@type":"java.util.HashMap",a:1},"2"],
            mock:""
        })
    });
    console.log("生成消息："+req.msgId);
    var sortClient = client.get({
        ip:"192.168.0.59",
        port:5555,
        isLong:Math.round(Math.random() * 100)% 2==0
    });
    sortClient.doRpc(req,function(responsePro){
            //取得结果返回
            if(responsePro.status == "0"){
                console.log("业务处理正常",responsePro.result);
            }else{
                console.log("服务端处理异常",responsePro.result);
            }
        },function(err){
            //连接异常等
            console.log("请求异常",err);
        }
    );
}
setInterval(function(){
    send();
},2000);
