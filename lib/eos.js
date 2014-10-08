var _ = require('underscore');
var util = require('util');
var assert = require("assert");
var client = require('./net/client');
var serviceLocation = require('./zookeeper/service_location');
var FilterChain = require('./filter/filter_chain');
var Filter = require('./filter/base_filter');
var MockFilter = require('./filter/mock_filter');
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
function init(opts){
    if(serviceHelper!=null){
        console.log("eos has init !");
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
    serviceHelper.connect();

}
function call(req,success,error,mockConfig){
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
    }
    fc.addFilter(new CallFilter());
    var res = new ResponseProtocol();
    fc.once("finish",function(req,res){
        //取得结果返回
        res.callback(req,success,error);
    });
    fc.doFilter(req,res);
}
function CallFilter(){
    Filter.call(this);
}
util.inherits(CallFilter,Filter);
CallFilter.prototype.doFilter = function(req, res,fc) {
    if (_.has(config._debugging_server_map,req.appId)) {
        req.debugServerIp = config._debugging_server_map[req.appId];
    } else if (_.has(config._debugging_server_map,"_defaultDebugServerIp")) {
        req.debugServerIp = config._debugging_server_map["_defaultDebugServerIp"];
    }
    var isMock = !_.isEmpty(req.mock);
    var ipPort = null;
    if(isMock){
        ipPort = serviceHelper.getOnlineEOS();
    }else{
        ipPort = serviceHelper.getServiceLocation(req.appId, req.serviceId, req.serviceVersion);
    }
    if (ipPort == null) {
        if (isMock) {
            var errorMsg = "对于模拟调用，没有找到可用的eos,请确保服务" + req.appId + "-"
                + req.serviceId + "-"
                + req.serviceVersion + "是否有效或者eos节点已经启动！";
            console.error(errorMsg);
            res.status = "1";
            res.result = {
                exception:Exception.create(Exception.MOCK_EXCEPTION,errorMsg)
            };
        } else {
            errorMsg = "没有找到请求的可用的eos节点,请确保服务" + req.appId + "-"
                + req.serviceId + "-"
                + req.serviceVersion + "是否有效或者eos节点已经启动！";
            console.error(errorMsg);
            res.status = "1";
            res.result = {
                exception:Exception.create(Exception.SERVICE_NO_FOUND_EXCEPTION,errorMsg)
            };
        }
        fc.doFilter(req, res);
        return;
    }

    var rpcClient = client.get({
        ip:ipPort.ip,
        port:ipPort.port,
        isLong:config.long_connect
    });
    rpcClient.doRpc(req,function(responsePro){
            _.extend(res,responsePro);
            fc.doFilter(req, res);
        },function(e){
            //连接异常等
//            console.log("请求异常",e);
            res.status = "1";
            res.result.exception = e;
            fc.doFilter(req, res);
        }
    );
}

module.exports = {
    util : util,
    init : init,
    call : call,
    config : config,
    RpcInvocation:params.RpcInvocation,
    RpcContext:params.RpcContext,
    RequestProtocol:RequestProtocol,
    Service:Service
}