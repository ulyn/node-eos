var eos = require("../lib/eos");
var RequestProtocol = require('../lib/protocol/request_protocol').RequestProtocol;
var params = require('../lib/params');
var Service = require('./service');
eos.init({
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
});

setInterval(function(){
    var service = new Service();
    service.testMap({"@type":"java.util.HashMap",a:1},"2",function(data){
        console.log("返回结果："+data);
        console.log("jsonStr："+JSON.stringify(data));
    },function(msg){
        console.log("调用服务异常："+msg);
    });
},5000);
