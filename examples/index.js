module.exports = function(eos){
    eos = eos || require("node-eos");
    var self = this;
    var fs = require('fs');
    var mockFileName = "./config_mock.js";
    fs.exists(mockFileName, function (exists) {
        if(exists){
            self.mock = require(mockFileName);
            fs.watchFile(mockFileName, function (curr, prev) {
                console.log('change %s ,mtime is: ' + curr.mtime,mockFileName);
                delete require.cache[require.resolve(mockFileName)];
                self.mock = require(mockFileName);
                console.info(self.mock);
            });
        }else{
            throw new Error("mock config file is no found ,please check the path of "+mockFileName+" is exists");
        }
    });
    return {
        eos:eos,
        testType:require("./testType")(eos,self.mock)
    }
}