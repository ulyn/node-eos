node-eos
========

eos(https://github.com/ulyn/eos) client for node.js

## Installation

You can install it using npm:

```bash
$ npm install node-eos
```
## Example

\. how to do:

```javascript
var eos = require("node-eos");
var RequestProtocol = eos.RequestProtocol;
var RpcContext = eos.RpcContext;
var RpcInvocation = eos.RpcInvocation;

eos.init({
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    long_connect: true,
    exclude_eos:[],//ignore eos
    debugging_server_ip: '', 
    use_mock: false, 
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
    var req = new RequestProtocol({
        appId:"test",
        serviceId:"testType",
        serviceVersion:"1.3",
        mock:"",
        debugServerIp:"",
        rpcContext:new RpcContext(),
        rpcInvocation:new RpcInvocation({
            "@type":"com.sunsharing.eos.common.rpc.impl.RpcInvocation",
            methodName:"testMap",
            parameterTypes:null,
            arguments:[{"@type":"java.util.HashMap",a:1},"2"],
            mock:""
        })
    });
    console.log("create message："+req.msgId);
    eos.call(req,function(data){
        console.log("result："+JSON.stringify(data));
    },function(msg){
        console.log("call exception："+msg);
    });
},5000);
```
