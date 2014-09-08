"use strict";

var net = require('net');
var _ = require('underscore');
var proFactory = require('../protocol/pro_factory');

var defaultOpts = {
    ip:"127.0.0.1",
    port:"5555",
    timeout:20000
}
function ShortClient(opts){
    _.extend(this,defaultOpts,opts);
}

ShortClient.prototype.doRpc = function(protocol,successFunc,errorFunc,timeout){
    var self = this;
    this.timeout = timeout || this.timeout;
    var conn = new net.createConnection(this.port, this.ip);
    conn.setTimeout(this.timeout);
    conn.on('data', function(trunk) {
//        console.log(trunk.toString());
        var analyseResult = proFactory.analyseWrapper(conn,trunk);
//        console.log(result.protocol);
        if(analyseResult.exception){
            console.error("package has exception");
            errorFunc && errorFunc("package has exception");
            conn.destroy();
            return;
        }
        if (!analyseResult.isWrap){
            return;
        }
        successFunc && successFunc(analyseResult.protocol)
        conn.destroy();
    });
    conn.on("connect",function(){
        console.log("send pro:" + protocol.action);
        var buff = protocol.createBuffer();
        conn.write(buff);
    });
    conn.on("end",function(){
        console.log("conn end");
    });
    conn.on("timeout",function(){
        console.error("conn timeout");
        errorFunc && errorFunc("timeout");
        conn.destroy();
    });
    conn.on("close ",function(){
        console.error("conn close");
    });
    conn.on("error",function(err){
        console.error(err);
        errorFunc && errorFunc("network exception ");
        conn.destroy();
    });
}


module.exports.ShortClient = ShortClient;