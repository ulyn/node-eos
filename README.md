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

1. init eos :

```javascript

	var eos = require("node-eos");
	eos.init({
    	zookeeper_ip: '192.168.0.224',
    	zookeeper_port: 2181,
    	long_connect: true,
    	exclude_eos:[],//ignore eos
    	debugging_server_ip: '', //debugging server ip
    	use_mock: true, //controll global mock 
    	mock_config_file: __dirname + "/config_mock.json" //mock config file path
	});

```

2. definde a eos service

```javascript
	
	module.exports = function(eos){
	    function testType(){
	        eos.Service.call(this);
	        this.appId = "test";
	        this.serviceId = "testType";
	        this.serviceVersion = "1.3";
	    }
	    eos.util.inherits(testType,eos.Service);
	
	    testType.prototype.testMap = function(map,str,successFunc,errorFunc){
	        var req = this._createReqPro("testMap",map,str);
	        eos.call(req,successFunc,errorFunc);
	    }
	    return testType;
	}

```

3. call service


```javascript
	
	var test =  require("./testType")(eos);

    new test.appService().testMap({"a":"1","b":"2"},"abc",function(data){
        console.log("get result："+JSON.stringify(data));
    },function(e){
        console.log("exception："+e);
    });

```

## document

### Filter ###


### mock config file ###


```

	{
    "mock":"",
    "appService":{
        "mock":"serviceMock",
        "method":{
            "getSystemConfig":"success",
            "testList":"error"
        }
    },
    "service2":{
        "mock":"success",
        "method":{
            "testMap":"success",
            "testList":"error"
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
