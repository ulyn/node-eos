var connection = require('./connection');

var DEFAULTS = {
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    debugging_server_ip: '', //联调服务端ip
    use_mock: false //全局控制是否使用mock
};
var conn = connection.getConnection({
    ip:"192.168.1.111",
    port:5555,
    isLong:true
});
conn.on("connect",function(){console.log("connect aaaaa")});
conn.on("error",function(err){console.log("connect error")});

