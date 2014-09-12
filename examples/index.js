module.exports = function(eos){
    eos = eos || require("node-eos");
    return {
        eos:eos,
        TestType:require("./TestType")(eos)
    }
}