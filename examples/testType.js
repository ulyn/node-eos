module.exports = function(eos,cache){
    function testType(rpcContext){
        eos.Service.call(this,rpcContext);
        console.info(this);
        this.appId = "test";
        this.serviceId = "testType";
        this.serviceVersion = "1.3";
    }
    eos.util.inherits(testType,eos.Service);

    testType.prototype.testMap = function(map,str,successFunc,errorFunc,mock){
        var req = this._createReqPro("testMap",mock,map,str);
        eos.callRemote(req,successFunc,errorFunc,cache.mockConfig);
    }
    testType.prototype.testMap.paramKey = ["map","str"];

    return testType;
}