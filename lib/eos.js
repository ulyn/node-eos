var _ = require('underscore');
var util = require('util');
var assert = require("assert");
var serviceLocation = require('./zookeeper/service_location');
var FilterChain = require('./filter/filter_chain');
var Filter = require('./filter/base_filter');
var MockFilter = require('./filter/mock_filter');
var CallFilter = require('./filter/call_filter');
var ResponseProtocol = require('./protocol/response_protocol').ResponseProtocol;
var RequestProtocol = require('./protocol/request_protocol').RequestProtocol;
var params = require('./params');
var Service = require('./base_service');
var Exception = require('./exception');

var config = {
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    long_connect: true,
    exclude_eos:[],//ignore eos
    debugging_server_ip: '', //联调服务端ip
    use_mock: false, //全局控制是否使用mock
    mock_online:true,//mock数据是否使用在线，当user_mock为true时生效
    filter:[] //path为正则表达式 {"path":/appid/testService/*,filter:new Filter()}
};
var serviceHelper = null;
function init(opts,callback){
    if(serviceHelper!=null){
        console.log("eos has init !");
        callback(serviceHelper);
        return;
    }
    _.extend(config,opts);

    config._debugging_server_map = {};
    if(!_.isEmpty(config.debugging_server_ip)){
        var arr = config.debugging_server_ip.split(";");
        for (var i= 0,l=arr.length;i<l;i++) {
            var ipStr = arr[i];
            if (ipStr.indexOf(":") != -1) {
                var temp = ipStr.split(":");
                console.log("应用：" + temp[0] + "，使用联调ip：" + temp[1]);
                config._debugging_server_map[temp[0]] = temp[1];
            } else {
                config._debugging_server_map["_defaultDebugServerIp"] = ipStr;
            }
        }
    }

    serviceHelper = serviceLocation.createServiceLocation(config.zookeeper_ip,config.zookeeper_port,config.exclude_eos);
    serviceHelper.connect(callback);

}
function callRemote(req,success,error,mockConfig){
    var fc = new FilterChain();
    var path = util.format("/%s/%s/%s",req.appId,req.serviceId,req.rpcInvocation.methodName);
    _.each(config.filter,function(obj){
        assert.ok(util.isRegExp(obj.path),"filter path must be isRegExp ");
        if(obj.path.test(path)){
            fc.addFilter(obj.filter);
        }
    });
    if(config.use_mock){
        fc.addFilter(new MockFilter(config.mock_online,mockConfig));
    }else{
        req.mock = "";
    }
    fc.addFilter(new CallFilter(serviceHelper,config));
    var res = new ResponseProtocol();
    fc.once("finish",function(req,res){
        //取得结果返回
        res.callback(req,success,error);
    });
    fc.doFilter(req,res);
}
module.exports = {
    util : util,
    init : init,
    callRemote : callRemote,
    config : config,
    RpcInvocation:params.RpcInvocation,
    RpcContext:params.RpcContext,
    RequestProtocol:RequestProtocol,
    Service:Service
}