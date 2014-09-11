node-eos
========

eos(https://github.com/ulyn/eos) client for node.js

## Installation

You can install it using npm:

```bash
$ npm install ss-test
```
## Example

\. how to do:

```javascript
var eos = require("node-eos");
var ssTest = require("ss-test");

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
    var testType = new ssTest.testType();
    testType.testMap({"@type":"java.util.HashMap",a:1},"2",
        function(data){
            console.log("result："+JSON.stringify(data));
        },
        function(msg){
            console.log("call exception："+msg);
        });
},5000);
```
