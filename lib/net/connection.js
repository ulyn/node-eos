"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var net = require('net');
var _ = require('underscore');
var proFactory = require('../protocol/pro_factory');
var heartPro = require('../protocol/heart_protocol');

var connections = [];
var defaultConfig = {
    ip:"127.0.0.1",
    port:5555,
    timeout:20000,
    isLong:false,
    refreshTime:new Date().getTime(),
    maxIdle:50
}
function Connection(realConfig){
    var self = this;
    self.heartPro = heartPro;
    self.config = realConfig;
    self.buffers = [];
    self.reconnectTimes = 0;
    self.isRemoved = false;
    reconnect(self);
    if(self.config.isLong&&!self.isRemoved){
        //long connection ,need to detect heartbeat
        check(self);
    }
    EventEmitter.call(this);
    self.setMaxListeners(0);
}
util.inherits(Connection, EventEmitter);
Connection.prototype.write = function writeFunction(protocol){
    console.log("send pro:" + protocol.action);
    var buff = protocol.createBuffer();
    this.conn.write(buff);
}

function check(connection){
    if(connection.isRemoved){
        return;
    }
    if(connection.reconnectTimes>connection.config.maxIdle){
        //over max reconnect times
        console.error("over max reconnect times");
        removeConnection(connection);
        return;
    }
    if((new Date().getTime()-connection.config.refreshTime)>30000)
    {
        console.error("more than 30 seconds is not responding.");
        reconnect(connection);
    }else{
        if(!connection.conn.writable){
            reconnect(connection);
        }else{
            //todo why cannot read heartPro;
            var heartPro = new connection.heartPro.HeartProtocol();
            connection.write(heartPro);
        }
    }
    setTimeout(function(){
        check(connection);
    },10000);
}
function reconnect(connection){
    if(connection.conn != null){
        connection.conn.destroy();
        connection.isConnected = false;
        //reconnect count
        connection.reconnectTimes++;
        console.log("reconnect...",connection.config.ip,connection.config.port, connection.reconnectTimes + " times");
    }
    var conn = new net.createConnection(connection.config.port, connection.config.ip);
    conn.setKeepAlive(true);
    conn.setTimeout(connection.config.timeout);
    connection.buffers = [];
    conn.on('data', function(trunk) {
//        console.log(trunk.toString());
        if (connection.buffers.length > 0) {
            trunk = Buffer.concat([connection.buffers,trunk]);
        }
        var result = proFactory.analyseWrapper(trunk);
//        console.log(result.protocol);
        if(result.exception){
            console.error("package has exception ,close connection");
            removeConnection(connection);
            return;
        }
        if (!result.isWrap)
            return;
        if(result.protocol instanceof heartPro.HeartProtocol){
            refreshHeartBeat(connection);
        }else{
            connection.emit("data",result.protocol);
        }
        if(!connection.config.isLong){
            //close short connection
            conn.destroy();
        }else{
            //long connection need cache leave buffers
            connection.buffers = result.buffer;
        }
        connection.buffers = [];
    });
    conn.on("connect",function(){
        connection.reconnectTimes = 0;
        connection.isConnected = true;
        refreshHeartBeat(connection);
        connection.emit("connect");
    });
    conn.on("end",function(){
        console.log("conn end");
        connection.emit("end");
    });
    conn.on("timeout",function(){
        console.error("conn timeout");
        connection.emit("timeout");
    });
    conn.on("close ",function(){
        console.log("close:"+err);
        connection.buffers = [];
        connection.emit("close");
    });
    conn.on("error",function(err){
//        console.log(err)
//        console.error("err:"+err);
        if(err.syscall == "connect"){
            //while connect error,emit error event
            //ignore reading stage error as it can be reconnect
            connection.emit("error",err);
        }
    });
    connection.conn = conn;
}
//get tcp connection,created when is no found
function getConnection(config) {
    var realConfig = _.extend({},defaultConfig,config);
    if(realConfig.isLong){
        for(var i=0;i<connections.length;i++){
            var connConfig = connections[i].config;
            if(connConfig.port == realConfig.port && connConfig.ip == realConfig.ip){
                return connections[i];
            }
        }
        //no cache connections
    }
    var connection = new Connection(realConfig);
    if(realConfig.isLong){
        //when
        connections.push(connection);
    }
    return connection;
}
function removeConnection(connection){
    connection.isRemoved = true;
    connection.conn.destroy();
    if(connection.config.isLong){
        var idx = _.indexOf(connections, connection);
        connections.splice(idx);
    }
}
function refreshHeartBeat(connection){
    console.log("refresh heart beat ..");
    connection.config.refreshTime = new Date().getTime();
}
module.exports = {
    Connection : Connection,
    getConnection : getConnection,
    removeConnection : removeConnection
}
