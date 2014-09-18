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
    mock_config_file:"",//mock文件绝对路径(__dirname可以使用），为支持修改mock不需要重启，如果使用user_mock=true时，每次请求都读此文件解析，不考虑效率
    filter:[] //path为正则表达式 {"path":/appid/testService/*,filter:new Filter()}
};
var serviceHelper = null;
function init(opts){
    if(serviceHelper!=null){
        console.log("eos has init !");
        return;
    }
    _.extend(config,opts);
    config.mockFilter = new MockFilter(config.mock_config_file);

    serviceHelper = serviceLocation.createServiceLocation(config.zookeeper_ip,config.zookeeper_port,config.exclude_eos);
    serviceHelper.connect();

}
function call(req,success,error){
    var fc = new FilterChain();
    var path = util.format("/%s/%s/%s",req.appId,req.serviceId,req.rpcInvocation.methodName);
    _.each(config.filter,function(obj){
        assert.ok(util.isRegExp(obj.path),"filter path must be isRegExp ");
        if(obj.path.test(path)){
            fc.addFilter(obj.filter);
        }
    });
    if(config.use_mock){
        fc.addFilter(config.mockFilter);
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
    req.debugServerIp = config.debugging_server_ip;
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
    RpcInvocation:params.RpcInvocation,
    RpcContext:params.RpcContext,
    RequestProtocol:RequestProtocol,
    Service:Service
}