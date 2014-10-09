node-eos
========

eos(https://github.com/ulyn/eos) client for node.js

This module has been tested to work with eos version 2.1.0.


## Installation

You can install it using npm:

```bash
$ npm install node-eos
```
## How to use

（1） init eos :

```javascript

	var eos = require("node-eos");
	eos.init({
	    zookeeper_ip: '127.0.0.1',
	    zookeeper_port: 2181,
	    long_connect: true,
	    exclude_eos:[],//ignore eos
	    debugging_server_ip: '', //联调服务端ip,多个应用可以用分号隔开，没有冒号的为默认，有具体指定则使用具体的。如：127.0.0.1；app1：192.168.0.60；app2:192.168.0.65
	    use_mock: false, //全局控制是否使用mock
	    mock_online:true,//mock数据是否使用在线，当user_mock为true时生效
	    filter:[] //path为正则表达式 {"path":/appid/testService/*,filter:new Filter()}
	});

```

（2） definde a eos service，you can use eos-uddi to generate it

```javascript
	
	module.exports = function(eos,mockConfig){
	    function testType(){
	        eos.Service.call(this);
	        this.appId = "test";
	        this.serviceId = "testType";
	        this.serviceVersion = "1.3";
	    }
	    eos.util.inherits(testType,eos.Service);
	
	    testType.prototype.testMap = function(map,str,successFunc,errorFunc){
	        var req = this._createReqPro("testMap",map,str);
	        eos.call(req,successFunc,errorFunc,mockConfig);
	    }
	    testType.prototype.testMap.paramKey = ["map","str"];
	
	    return testType;
	}

```

（3） call service


```javascript
	
	var testType =  require("./testType")(eos);

    new testType().testMap({"a":"1","b":"2"},"abc",function(data){
        console.log("get result："+JSON.stringify(data));
    },function(e){
        console.log("exception："+e);
    });

```

## document

### Filter ###


### mock config file ###
config_mock.js

```

	module.exports = {
	    mock:{
	        "testType":{
	            "testMap":""//a
	        }
	    },
	    offlineData:{
	        "testType":{
	            "testMap":{
	                "a":"a"
	            }
	        }
	    }
	}


```
### Exception  ###

  the errorFunc params

- getMessage
- getCode
- getName
 


## notes



- please ensure that the eos is loaded only once

- 
