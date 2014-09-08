"use strict";

var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var proFactory = require('../protocol/pro_factory');
var SortClient = require('./sort_client').SortClient;
var heartPro = require('../protocol/heart_protocol');
var basePro = require('../protocol/base_protocol');

var clientCache = [];
var defaultOpts = {
    ip:"127.0.0.1",
    port:"5555",
    timeout:20000
}
function LongClient(opts){
    var client = _.find(clientCache, function(client){
        return client.port == opts.port && client.ip == opts.ip;
    });
    if(!client){
        console.log("create a new long client ...");
        //no cache connections
        SortClient.call(this);
        var eventClient = _.extend(new EventEmitter(),defaultOpts,opts);
        client = create(eventClient);
        client.on("createError",function(err){
            console.error("create long client error ");
        });
        client.heartPro = heartPro;
        clientCache.push(client);
    }
    this.client = client;
}
util.inherits(LongClient, SortClient);

LongClient.prototype.doRpc = function(protocol,successFunc,errorFunc,timeout){
    var client = this.client;
    var onData = function(responsePro){
        console.log(responsePro);
        if(responsePro.action == basePro.HEAD_REQUEST_RESULT){
            if(protocol.msgId == responsePro.msgId){
                console.log( "receive response data :"+responsePro.msgId );
                //remove on data listener and timeout detection
                client.removeListener("data",onData);
                client.removeListener("error",onError);
                clearTimeout(intervalId);
                //process my msg
                successFunc && successFunc(responsePro);
            }
        }
    }
    var onError = function(err){
        client.removeListener("data",onData);
        client.removeListener("error",onError);
        clearTimeout(intervalId);
        errorFunc && errorFunc("network exception");
    }
    var onReady = function(){
        client.conn.write(protocol.createBuffer());
    }
    if(client.isReady){
        client.conn.write(protocol.createBuffer());
    }else{
        var onReady = function(){
            client.conn.write(protocol.createBuffer());
        }
        client.once("ready",onReady);
    }
    var intervalId = setTimeout(function(){
        //timeout detection
        console.error(protocol.serviceId,protocol.rpcInvocation.methodName,
            "result is timeout:"+protocol.msgId);
        client.removeListener("data",onData);
        client.removeListener("error",onError);
    },timeout || this.client.timeout);
    client.on("data",onData);
    client.on("error",onError);
}
LongClient.prototype.close = function(){
    this.client.isRemoved = true;
    this.client.conn.destroy();
    _.without(clientCache,this.client);
}

function create(client){
    if(client.conn != null){
        client.conn.destroy();
        client.conn = null;
        //reconnect count
        client.reconnectTimes++;
        console.log("reconnect...",client.ip,client.port, client.reconnectTimes + " times");
    }else{
        client.reconnectTimes = 0;
        client.maxIdle = 50;
        client.reqQueue = [];
        client.isReady = false;
        console.log("connect...",client.ip,client.port, client.reconnectTimes + " times");
    }
    client.refreshTime = new Date().getTime();
    var conn = new net.createConnection(client.port, client.ip);
    client.conn = conn;
    conn.setTimeout(client.timeout);
    conn.setKeepAlive(true);
    conn.on('data', function(trunk) {
        console.log(trunk.toString());
        if (conn.bufferCache && conn.bufferCache.length > 0) {
            trunk = Buffer.concat([conn.bufferCache,trunk]);
        }
        var analyseResult = proFactory.analyseWrapper(trunk);
        console.log(analyseResult);
        //long connection need cache leave buffers
        conn.bufferCache = analyseResult.buffer;
//        console.log(result.protocol);
        if(analyseResult.exception){
            console.error("package has exception");
            client.isReady = false;
            client.isRemoved = true;
            client.conn.destroy();
            _.without(clientCache,client);
            client.emit("error","package has exception");
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
    });
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
            //todo why cannot read heartPro;
            var heartPro = new client.heartPro.HeartProtocol();
            console.log("send heart ....")
            client.conn.write(heartPro.createBuffer());
        }
    }
    setTimeout(function(){
        check(client);
    },10000);
}
//function startWriteThread(client){
//    if(client.isRemoved){
//        client.reqQueue = [];
//        return;
//    }
//    write reqQueue
//    setTimeout(function(){
//        startWriteThread(client);
//    },10);
//}

module.exports.LongClient = LongClient;