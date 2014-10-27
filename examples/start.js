var eos = require("../lib/eos");
eos.init({
    zookeeper_ip: '192.168.0.224',
    zookeeper_port: 2181,
    long_connect: true,
    exclude_eos:[],//ignore eos
    debugging_server_ip: '', //联调服务端ip
    use_mock: true, //全局控制是否使用mock
    mock_online:true,//mock数据是否使用在线，当user_mock为true时生效
    filter:[] //path为正则表达式 {"path":/appid/testService/*,filter:new Filter()}
});
var services = require("./index")(eos);
var testType = new services.testType({"test":""});
setInterval(function(){
    testType.testMap({"name":"张三"},"str_p",function(data){
        console.log("success",data);
    },function(e){
        console.error("error",e);
    },"success");
},1000);