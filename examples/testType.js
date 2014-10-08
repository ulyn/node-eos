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