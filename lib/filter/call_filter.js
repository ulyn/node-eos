var _ = require('underscore');
var util = require('util');
var Filter = require('./base_filter');
var Exception = require('../exception');
var client = require('../net/client');

function CallFilter(serviceHelper,config){
    Filter.call(this);
    this.serviceHelper = serviceHelper;
    this.config = config;
}
util.inherits(CallFilter,Filter);

CallFilter.prototype.before = function(req, res,fc) {
    if (_.has(this.config._debugging_server_map,req.appId)) {
        req.debugServerIp = this.config._debugging_server_map[req.appId];
    } else if (_.has(this.config._debugging_server_map,"_defaultDebugServerIp")) {
        req.debugServerIp = this.config._debugging_server_map["_defaultDebugServerIp"];
    }
    var isMock = !_.isEmpty(req.mock);
    var ipPort = null;
    if(isMock){
        ipPort = this.serviceHelper.getOnlineEOS();
    }else{
        ipPort = this.serviceHelper.getServiceLocation(req.appId, req.serviceId, req.serviceVersion);
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
        isLong:this.config.long_connect
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

module.exports = CallFilter;