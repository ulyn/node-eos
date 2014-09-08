var basePro = require("./base_protocol");
var heartPro = require("./heart_protocol");
var responsePro = require("./response_protocol");

function analyseWrapper(buffer) {
    var result = {
            isWrap: false,
            protocol: null,
            buffer:buffer,
            exception:false
        }
    if (buffer.length < 1) {
        return result;
    }
    var action = buffer.toString('utf-8',0,1);
    switch (action){
        case basePro.HEAD_HEART_BEAT:
            //heart protocol
            result.protocol = heartPro.toProtocol(buffer);
            break;
        case basePro.HEAD_REQUEST_RESULT:
            result.protocol = responsePro.toProtocol(buffer);
            break;
        case basePro.HEAD_REQUEST_MSG:
            // client does not attention request protocol form buffer
            //it can not arrive
            result.exception = true;
    }
    if(result.protocol != null){
        result.isWrap = true;
        result.buffer = buffer.slice(result.protocol.bodyLength + 52);//bodyLength + 52（header length）;
    }
    return result;
}

module.exports.analyseWrapper = analyseWrapper;