var uuid = require('uuid');

var HEAD_REQUEST_MSG = 'A';
var HEAD_REQUEST_RESULT = 'B';
var HEAD_HEART_BEAT = 'H';

function BaseProtocol(){
    console.log("call BaseProtocol");
}
BaseProtocol.prototype.action;
BaseProtocol.prototype.msgId = uuid.v4().replace(/-/g,"");
BaseProtocol.prototype.serialization = "fastjson";
BaseProtocol.prototype.bodyLength = 0;

//get base protocol header buffer
BaseProtocol.prototype.getHeaderBuff = function getHeaderBuff(bodyLength) {
    if(bodyLength){
        this.bodyLength = bodyLength;
    }
    var header = new Buffer(52);
    header.fill();
    header.write(this.action);
    header.write(this.msgId,1,32);
    header.write(this.serialization,33,15);//serialization
    header.writeInt32BE(this.bodyLength,48,true);
    return header;
}
//set header buffer into protocol
BaseProtocol.prototype.setHeader = function setHeader(pro, buffer) {
    pro.action = buffer.toString('utf8', 0, 1);;
    pro.msgId = buffer.toString('utf8', 1, 32);
    pro.serialization = buffer.toString('utf8',33, 47);
    pro.bodyLength = buffer.readInt32BE(48);
}
//child class must overwrite this method
BaseProtocol.prototype.createBuffer = function createBuffer(){
    return this.getHeaderBuff(0);
}

module.exports = {
    HEAD_REQUEST_MSG:HEAD_REQUEST_MSG,
    HEAD_REQUEST_RESULT:HEAD_REQUEST_RESULT,
    HEAD_HEART_BEAT:HEAD_HEART_BEAT,
    BaseProtocol:BaseProtocol
}