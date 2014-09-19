var basePro = require("./base_protocol");
var heartPro = require("./heart_protocol");
var responsePro = require("./response_protocol");

function analyseWrapper(conn,buffer) {
    var result = {
            isWrap: false,
            protocol: null,
            exception:false
        }
    if(!conn.bufferCache){
        conn.bufferCache = new Buffer(0);
    }
    if (buffer && buffer.length > 0) {
        conn.bufferCache = Buffer.concat([conn.bufferCache,buffer]);
    }
    if (conn.bufferCache.length < 1) {
        return result;
    }

    var action = conn.bufferCache.toString('utf8',0,1);
    switch (action){
        case basePro.HEAD_HEART_BEAT:
            //heart protocol
            result.protocol = heartPro.toProtocol(conn.bufferCache);
            break;
        case basePro.HEAD_REQUEST_RESULT:
            result.protocol = responsePro.toProtocol(conn.bufferCache);
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
            conn.bufferCache = conn.bufferCache.slice(1);//bodyLength + 52（header length）;
        }else{
            conn.bufferCache = conn.bufferCache.slice(result.protocol.bodyLength + 53);//bodyLength + 52（header length） + 1（start index）;
        }
    }else{
        //cache leave buffers
//        conn.bufferCache = conn.bufferCache;
    }
    return result;
}

module.exports.analyseWrapper = analyseWrapper;