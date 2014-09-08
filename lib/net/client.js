var LongClient = require('./long_client').LongClient;
var ShortClient = require('./short_client').ShortClient;

function get(opts){
    if(opts.isLong){
        return new LongClient(opts);
    }else{
        return new ShortClient(opts);
    }
}

module.exports = {
    get: get,
    LongClient: LongClient,
    ShortClient: ShortClient
}