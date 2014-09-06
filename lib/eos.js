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
var conn = connection.getConnection({
    ip:"192.168.1.111",
    port:5555,
    isLong:false
});
conn.on("connect",function(){
    var req = new RequestProtocol({
        appId:"test",
        serviceId:"testType",
        serviceVersion:"1.3",
        mock:"",
        debugServerIp:"",
        rpcContext:new params.RpcContext(),
        rpcInvocation:new params.RpcInvocation({
            methodName:"testMap",
            parameterTypes:null,
            arguments:[{a:1},"2"],
            mock:""
        })
    });
    map[req.msgId];
    conn.write(req);
    setTimeout(function(){
        //检测结果是否返回
        if(map[req.msgId]){
            //callback timeout
        }
    },20000);
});
conn.on("data",function(protocol){
    if(protocol.action == basePro.HEAD_REQUEST_RESULT){
        //返回协议
        console.log(protocol);
//        callback
    }
});
conn.on("error",function(err){console.log("connect error")});

