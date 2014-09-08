var connection = require('./connection');
var _ = require('underscore');
var basePro = require('../protocol/base_protocol');

function doRpc(opt){
    var opts = _.extend({
        ip:"127.0.0.1",
        port:"5555",
        isLong:true,
        protocol:null,
        success:function(result){},
        error:function(err){},
        timeout:20000
    },opt);
    var self = this;
    self.conn = connection.getConnection({
        ip:opts.ip,
        port:opts.port,
        isLong:opts.isLong
    });
    var onConnect = function(){
        self.conn.write(opts.protocol);
    }
    var onData = function(responsePro){
        if(responsePro.action == basePro.HEAD_REQUEST_RESULT){
            if(opts.protocol.msgId == responsePro.msgId){
                console.log(responsePro.msgId + "receive response data ");
                //remove on data listener and timeout detection
                self.conn.removeListener("data",onData);
                self.conn.removeListener("error",onError);
                clearTimeout(intervalId);
                //process my msg
                var status = responsePro.status;
                var result = responsePro.result;
                if(status==0){
                    //success
                    opts.success(result);
                }else{
                    //server exception
                    console.error(result);
                    opts.error(result);
                }
            }
        }
    }
    var onError = function(err){
        self.conn.removeListener("data",onData);
        self.conn.removeListener("error",onError);
        clearTimeout(intervalId);
        opts.error(err);
    }
    var intervalId = setTimeout(function(){
        //timeout detection
        console.error(opts.protocol.serviceId,opt.protocol.rpcInvocation.methodName,
            "result is timeout:"+opts.protocol.msgId);
        self.conn.removeListener("data",onData);
        self.conn.removeListener("error",onError);
    },opts.timeout);
    self.conn.once("connect",onConnect);
    self.conn.on("data",onData);
    self.conn.on("error",onError);
    if(self.isConnected){
        self.conn.write(opts.protocol);
    }
}

module.exports.doRpc = doRpc;