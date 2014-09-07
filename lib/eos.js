var connection = require('./connection');
var RequestProtocol = require('./protocol/request_protocol').RequestProtocol;
var basePro = require('./protocol/base_protocol');
var params = require('./params');

var DEFAULTS = {
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    debugging_server_ip: '', //联调服务端ip
    use_mock: false //全局控制是否使用mock
};
var map =  {};

function send(){
    var conn = connection.getConnection({
        ip:"192.168.1.111",
        port:5555,
        isLong:true
    });
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
//    console.log(JSON.stringify(req.rpcInvocation))
//    map[req.msgId];
    conn.write(req);
    var intervalId = setTimeout(function(){
        //超时
        console.error("等待结果超时:"+req.msgId);
        conn.removeListener("data",sendCallback);
    },20000);
    var sendCallback = function(protocol){
        if(protocol.action == basePro.HEAD_REQUEST_RESULT){
            console.log("返回："+protocol.msgId);
            //返回协议
//            console.log(protocol);
//        callback
            if(protocol.msgId == req.msgId){
                console.log("移除监听与超时检测------");
                conn.removeListener("data",sendCallback);
                clearTimeout(intervalId);
                //my msg
                var status = protocol.status;
                var result = protocol.result;
                if(status==0){
                    //正常
                    console.log(result);
                }else{
                    //请求时，服务端抛出异常
                    console.log(result);
                }
            }
        }
    }
    conn.on("data",sendCallback);

    conn.on("connect",function(){
    });
    conn.on("error",function(err){console.log("connect error")});
}
setInterval(function(){
    send();
},2000);
