var _ = require('underscore');
var util = require('util');
var Filter = require('./base_filter');

function MockFilter(mock_online,mockConfig){
    Filter.call(this);
    this.mockConfig = mockConfig;
    this.mock_online = mock_online;
}
util.inherits(MockFilter,Filter);

MockFilter.prototype.doFilter = function(req, res,fc) {
    var mocks = this.mockConfig["mock"];
    var serviceMocks = mocks[req.serviceId];
    req.mock = serviceMocks[req.rpcInvocation.methodName];
    if(!this.mock_online){
        res.status = "0";
        var data = this.mockConfig["offlineData"];
        var serviceMockData = mocks[req.serviceId];
        var methodMockData = serviceMockData[req.rpcInvocation.methodName];
        if(methodMockData==null){
            res.status = "1";
            res.result = {
                exception:Exception.create(Exception.MOCK_EXCEPTION,req.appId+"的离线模拟的配置文件异常：没有指定"
                    + req.serviceId +"-"+ eq.rpcInvocation.methodName +"的模拟数据")
            };
        }
        if(_.isEmpty(req.mock)){
            console.warn("mock_online=false取非在线模拟数据，但未指定模拟参数,取第一个数据模拟");
            var keys = _.keys(methodMockData);
            if(keys.length>0){
                res.result = {
                    value:methodMockData[keys[0]]
                };
            }else{
                res.status = "1";
                res.result = {
                    exception:Exception.create(Exception.MOCK_EXCEPTION,req.appId+"的离线模拟的配置文件异常：取非在线模拟数据"
                        + req.serviceId +"-"+ eq.rpcInvocation.methodName +",但无配置任何数据")
                };
            }
        }else{
            if(_.has(methodMockData,req.mock)){
                res.result = {
                    value:methodMockData[req.mock]
                };
            }else{
                res.status = "1";
                res.result = {
                    exception:Exception.create(Exception.MOCK_EXCEPTION,req.appId+"的离线模拟的配置文件异常：取非在线模拟数据"
                        + req.serviceId +"-"+ eq.rpcInvocation.methodName +",但没有配置指定的mock["+req.mock+"]的数据")
                };
            }
        }

        fc.finish(req, res);
    }else{
        fc.doFilter(req,res);
    }
}

module.exports = MockFilter;