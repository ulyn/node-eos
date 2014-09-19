var LongClient = require('./long_client');
var ShortClient = require('./short_client');

function get(opts){
    if(opts.isLong){
        return LongClient.getClient(opts);
    }else{
        return new ShortClient(opts);
    }
}

module.exports = {
    get: get,
    LongClient: LongClient,
    ShortClient: ShortClient
}