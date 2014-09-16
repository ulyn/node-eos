module.exports = function(eos){
    eos = eos || require("node-eos");
    return {
        eos:eos,
        testType:require("./testType")(eos)
    }
}