module.exports = function(eos){
    eos = eos || require("node-eos");
    var self = this;
    self.cache = {};
    if(eos.config.use_mock){
        var fs = require('fs');
        var path = require('path');
        var mockFileName = path.resolve(__dirname, './config_mock.js');

        var exists = fs.existsSync(mockFileName);
        if(exists){
            self.cache.mockConfig = require(mockFileName);
            fs.watchFile(mockFileName, function (curr, prev) {
                console.log('change %s ,mtime is: ' + curr.mtime,mockFileName);
                delete require.cache[require.resolve(mockFileName)];
                self.cache.mockConfig = require(mockFileName);
                console.info("reload mock config finish:"+mockFileName);
            });
        }else{
            console.warn("mock config file is no found ,please check the path of "+mockFileName+" is exists");
        }
    }
    return {
        eos:eos,
        testType:require("./testType")(eos,self.cache)
    }
}