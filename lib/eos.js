var RequestProtocol = require('./protocol/request_protocol').RequestProtocol;
var params = require('./params');
var client = require('./net/client');
var serviceLocation = require('./zookeeper/service_location');
var DEFAULTS = {
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    eos_filter:"",
    debugging_server_ip: '', //联调服务端ip
    use_mock: false //全局控制是否使用mock
};
var sl = serviceLocation.createServiceLocation(DEFAULTS.zookeeper_ip,DEFAULTS.zookeeper_port);
sl.connect();
setInterval(function(){
    sl.printCache();
},5000);