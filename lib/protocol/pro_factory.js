var basePro = require("./base_protocol");
var heartPro = require("./heart_protocol");
var responsePro = require("./response_protocol");

function analyseWrapper(conn,buffer) {
    var result = {
            isWrap: false,
            protocol: null,
            exception:false
        }
    if (buffer.length < 1) {
        return result;
    }
    if (conn.bufferCache && conn.bufferCache.length > 0) {
        buffer = Buffer.concat([conn.bufferCache,buffer]);
    }
    var action = buffer.toString('utf8',0,1);
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
        //cache leave buffers
        if(result.protocol instanceof heartPro.HeartProtocol){
            conn.bufferCache = buffer.slice(1);//bodyLength + 52（header length）;
        }else{
            conn.bufferCache = buffer.slice(result.protocol.bodyLength + 53);//bodyLength + 52（header length） + 1（start index）;
        }
    }else{
        //cache leave buffers
        conn.bufferCache = buffer;
    }
    return result;
}

module.exports.analyseWrapper = analyseWrapper;