"use strict";

var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var proFactory = require('../protocol/pro_factory');
var heartPro = require('../protocol/heart_protocol');
var Exception = require('../exception');

var clientCache = [];
var defaultOpts = {
    ip:"127.0.0.1",
    port:"5555",
    timeout:20000
}
function LongClient(opts){
    console.log("create a new long client ...");
    _.extend(this,defaultOpts,opts);
    this.heartProBuff = new heartPro.HeartProtocol().createBuffer();
    create(this);
    clientCache.push(this);
}
util.inherits(LongClient, EventEmitter);

LongClient.prototype.doRpc = function(protocol,successFunc,errorFunc,timeout){
    var client = this;
    var intervalId,onData,onError,onReady;
    onData = function(responsePro){
        if(protocol.msgId == responsePro.msgId){
//                console.log( "receive response data :"+responsePro.msgId );
            //remove on data listener and timeout detection
            client.removeListener("data",onData);
            client.removeListener("error",onError);
            clearTimeout(intervalId);
            //process my msg
            successFunc && successFunc(responsePro);
        }
    }
    onError = function(err){
        client.removeListener("data",onData);
        client.removeListener("error",onError);
        clearTimeout(intervalId);
        errorFunc && errorFunc(err);
    }
    onReady = function(){
//        console.log("send request,msgId = " + protocol.msgId);
        client.conn.write(protocol.createBuffer());
    }
    //set check request timeout
    intervalId = setTimeout(function(){
        //timeout detection
        console.error(protocol.serviceId,protocol.rpcInvocation.methodName,
            "result is timeout:"+protocol.msgId);
        client.removeListener("data",onData);
        client.removeListener("error",onError);
        errorFunc && errorFunc(new Exception(Exception.TIMEOUT_EXCEPTION,
            protocol.serviceId+protocol.rpcInvocation.methodName + " wait result is timeout:"+protocol.msgId, client.doRpc));
//       console.log("listenerCount：" + EventEmitter.listenerCount(client, "data"));
    },timeout || client.timeout);
    //remember write data must be after setListener !!!! ensure intervalId be clear
    client.on("data",onData);
    client.on("error",onError);
    if(client.isReady){
        onReady();
    }else{
        client.once("ready",onReady);
    }

}
LongClient.prototype.close = function(){
    this.isRemoved = true;
    this.conn.destroy();
    _.without(clientCache,this);
}

function create(client){
    if(client.conn != null){
        client.conn.removeAllListeners();
        client.conn.destroy();
        client.conn = null;
        //reconnect count
        client.reconnectTimes++;
        console.log("reconnect...",client.ip,client.port, client.reconnectTimes + " times");
    }else{
        client.reconnectTimes = 0;
        client.maxIdle = 20;
        client.reqQueue = [];
        client.isReady = false;
        console.log("connect...",client.ip,client.port, client.reconnectTimes + " times");
    }
    client.refreshTime = new Date().getTime();
    var conn = new net.connect(client.port, client.ip);
    client.conn = conn;
    conn.setTimeout(client.timeout);
    conn.setKeepAlive(true);
    var analyseOnData = function(data){
        //        console.log(trunk.toString());
        var analyseResult = proFactory.analyseWrapper(conn,data);
//        console.log(analyseResult);
        if(analyseResult.exception){
            console.error("package has exception");
            client.isReady = false;
            client.isRemoved = true;
            client.conn.destroy();
            _.without(clientCache,client);
            client.emit("error",Exception.create(Exception.NETWORK_PACKAGE_EXCEPTION,"package has exception"));
            return;
        }
        if (!analyseResult.isWrap){
            return;
        }
        if(analyseResult.protocol instanceof heartPro.HeartProtocol){
            //refreshHeartBeat
            client.refreshTime = new Date().getTime();
        }else{
            client.emit("data",analyseResult.protocol);
        }
        analyseOnData();
    }
    conn.on('data', analyseOnData);
    conn.once("connect",function(){
        client.isReady = true;
        if(client.reconnectTimes!=0){
            client.reconnectTimes = 0;
        }else{
            check(client);
        }
        client.emit("ready");
    });
    conn.on("end",function(){
        console.log("conn end");
    });
    conn.on("close ",function(){
        console.error("conn close");
    });
    conn.on("error",function(err){
        console.error(err);
//        client.emit("error","network exception ");
    });
    return client;
}
function check(client){
    if(client.isRemoved){
        return;
    }
    if(client.reconnectTimes> client.maxIdle){
        //over max reconnect times
        console.error("over max reconnect times");
        client.isRemoved = true;
        client.conn.destroy();
        _.without(clientCache,client);
        return;
    }
    if((new Date().getTime()-client.refreshTime)>30000)
    {
        console.error("more than 30 seconds is not responding.");
        create(client);
    }else{
        if(!client.conn.writable){
            create(client);
        }else{
//            console.log("send heart ....");
            client.conn.write(client.heartProBuff);
        }
    }
    setTimeout(function(){
        check(client);
    },10000);
}

module.exports.getClient = function(opts){
    var client = _.find(clientCache, function(client){
        return client.port == opts.port && client.ip == opts.ip;
    });
    if(client){
        return client;
    }else{
        //no cache connections
        return new LongClient(opts);
    }
}