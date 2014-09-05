var opts = {
    action:"",
    msgId:"",
    serialization:"",
    bodyLength:""
}
function BaseProtocol(){
    this.opts =
}
BaseProtocol.prototype.REQUEST_MSG = 'A';
BaseProtocol.prototype.REQUEST_MSG_RESULT = 'B';
BaseProtocol.prototype.HEART_BEAT = 'H';

BaseProtocol.prototype.action;
BaseProtocol.prototype.msgId;
BaseProtocol.prototype.serialization = "hessian";
BaseProtocol.prototype.bodyLength;

BaseProtocol.prototype.getHeaderBytes = function() {
    byte[] header = new byte[52];
    header[0] = action;
    StringUtils.putString(header, msgId, 1);
    StringUtils.putString(header, serialization, 33);
    StringUtils.putInt(header, getRealBodyLength(), 48);
    return header;
}

BaseProtocol.prototype.setHeader = function(pro, buffer) {
    pro.action = buffer.readByte();
    pro.msgId = this.readString(32, buffer);
    pro.serialization = this.readString(15, buffer);
    pro.bodyLength = buffer.readInt();
}

BaseProtocol.prototype.readString = function(len, buffer) {
    byte[] bu = new byte[len];
    buffer.readBytes(bu);
    try {
        String s = new String(bu, "UTF-8").trim();
        return s;
    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}

protected byte[] getSerializationBytes(Object o) throws Exception {
    Serialization serial = SerializationFactory.createSerialization(serialization);
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    ObjectOutput objectOutput = serial.serialize(outputStream);
    objectOutput.writeObject(o);
    objectOutput.flushBuffer();
    return outputStream.toByteArray();
}

protected <T> T serializationBytesToObject(byte[] bytes, Class<T> cls) throws Exception {
    Serialization serial = SerializationFactory.createSerialization(serialization);
    InputStream inputStream = new ByteArrayInputStream(bytes);
    ObjectInput objectInput = serial.deserialize(inputStream);
    return objectInput.readObject(cls);
    }


protected abstract int getRealBodyLength();

public abstract ChannelBuffer generate();

public abstract BaseProtocol createFromChannel(ChannelBuffer buffer);