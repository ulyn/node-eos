var RequestProtocol = require('../lib/protocol/request_protocol').RequestProtocol;
var params = require('../lib/params');
var client = require('../lib/net/client');
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
        ip:"192.168.0.60",
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
