var http = require('http');
var util = require('util');
var events = require('events');

var DEFAULTS = {
    zookeeper_ip: '127.0.0.1',
    zookeeper_port: 2181,
    debugging_server_ip: '', //联调服务端ip
    use_mock: false //全局控制是否使用mock
};

function Client(options) {
    options = options || {};
    this.options = merge(options, DEFAULTS);
}

exports.Client = Client;

util.inherits(Client, events.EventEmitter);

Client.prototype.request = function(options, callback) {
    var client = this;
    options = options || {};
    options = merge(options, client.options);
    if (!options.headers) options.headers = {};
    options.headers.host = options.host + ':' + options.port;
    var buffer = '';
    var request = http.request(options, function(response) {
        response.on('data', function(chunk) {
            buffer += chunk;
        });
        response.on('end', function() {
            if (response.statusCode !== 200) {
                var err = new Error(exports.getError(buffer));
                err.headers = { status: response.statusCode };
                callback(err);
            } else {
                callback(null, buffer);
            }
        });
    });
    request.on('error', function (e) {
        client.emit('error', e);
        callback(e);
    });
    if (options.data) {
        request.write(options.data, options.requestEncoding || 'utf8');
    }
    request.end();
};

// main export function
exports.createClient = function(options) {
    var client = new Client(options);
    return client;
};


// Helper functions
function merge(a, b){
    if (a && b) {
        for (var key in b) {
            if (typeof a[key] == 'undefined') {
                a[key] = b[key];
            } else if (typeof a[key] == 'object' && typeof b[key] == 'object') {
                a[key] = merge(a[key], b[key]);
            }
        }
    }
    return a;
}