var util = require('util');
var Filter = require('./base_filter');
var fs = require('fs');

function MockFilter(filename){
    Filter.call(this);
    var self = this;
    fs.exists(filename, function (exists) {
        if(exists){
            self.config = readConfig(filename);
            fs.watchFile(filename, function (curr, prev) {
                console.log('change %s ,mtime is: ' + curr.mtime,filename);
                self.config = readConfig(filename);
            });
        }else{
            console.error("mock config file is no found ,please check the path of %s is exists",filename);
        }
    });
}
util.inherits(MockFilter,Filter);

MockFilter.prototype.doFilter = function(req, res,fc) {
    if(this.config){
        var allMock = this.config.mock;
        var serviceMock = null;
        var methodMock = null;
        var service = this.config[req.serviceId];
        if(service){
            serviceMock = service.mock;
            var method = service.method;
            if(method){
                methodMock = method[req.rpcInvocation.methodName];
            }
        }
        req.mock = methodMock || serviceMock || allMock || "";
        fc.doFilter(req, res);
    }else{
        console.warn("no mock config but call mock filter");
    }
}

function readConfig(filename){
    try{
        var txt = fs.readFileSync(filename, "utf8");
        return JSON.parse(txt);
    }catch (e){
        console.error("mock config parse json exception",e);
    }
}

module.exports = MockFilter;

//{
//    "mock":"",
//    "service":{
//        mock:"serviceMock",
//        method:{
//            "testMap":"success",
//            "testList":"error"
//        }
//    },
//    "service2":{
//        mock:"success",
//        method:{
//            "testMap":"success",
//            "testList":"error"
//        }
//    }
//}