var zookeeper = require('node-zookeeper-client');
var _ = require('underscore');

var SERVICE_STATE="/SERVICE_STATE";
var EOS_STATE = "/EOS_STATE";

function ServiceLocation(ip,port,excludeEos) {
    this.eosMap = {};
    this.ip = ip;
    this.port = port;
    this.excludeEos = excludeEos || [];
}
ServiceLocation.prototype.connect = function connect() {
    var self = this;
    if(self.zookeeper){
        console.warn("Zookeeper already connected %s:%s",self.ip,self.port);
    }else{
        console.log("Start ZooKeeper %s:%s",self.ip,self.port);
        self.zookeeper = zookeeper.createClient(self.ip+":"+self.port);
        self.zookeeper.once('connected', function () {
            console.log("Connected to ZooKeeper.%s:%s",self.ip,self.port);
            startWatchEos(self);
        });
        self.zookeeper.on('state', function (state) {
            console.log("ZooKeeper.%s:%s state is changed:%s",self.ip,self.port,state);
        });
        self.zookeeper.connect();
    }
}
ServiceLocation.prototype.printCache = function(){
    console.log("printCache",JSON.stringify(this.eosMap));
}
ServiceLocation.prototype.getServiceLocation = function(appId, serviceId, version, mock){
    var ips = [];
    var servicePath = appId + serviceId + version;
    _.each(this.eosMap,function(eosObject,eosId){
        var services = eosObject["services"];
        if(mock || !_.isNull(services[servicePath])){
            ips.push({
                "ip":eosObject["eos_ip"],
                "port":eosObject["eos_port"]
            });
        }
    });
    if (ips.length == 0) {
        return null;
    }
    var r = Math.random() * ips.length;
    var index = Math.floor(r);
    if (index >= ips.length) {
        index = 0;
    }
    return ips[index];
}
ServiceLocation.prototype.getOnlineEOS = function(){
    return this.getServiceLocation(null,null,null,true);
}
function startWatchEos(serviceLocation){
    var path = EOS_STATE;
    var zookeeper = serviceLocation.zookeeper;
    zookeeper.getChildren(
        path,
        function (event) {
//            console.log('Got eos watcher event: %s', event);
            startWatchEos(serviceLocation);
        },
        function (error, children, stat) {
            if (error) {
                console.log(
                    'Failed to list eos node of %s due to: %s.',
                    path,
                    error
                );
                return;
            }

            updateEos(serviceLocation,children);
        }
    );
}
function updateEos(serviceLocation,children){
    _.each(children, function(eosId){
        if(_.contains(serviceLocation.excludeEos,eosId)){
            console.log("EOS:%s online. but in excludeEos",eosId);
            return;
        }
        if(!_.has(serviceLocation.eosMap,eosId)){
            console.log("EOS:%s online.",eosId);
            addEos(serviceLocation,eosId);
        }
    });
    for (var eosId in serviceLocation.eosMap) {
        if (!_.contains(children,eosId)) {
            console.log("EOS:%s offline.",eosId);
            removeEos(serviceLocation,eosId);
        }
    }
}
function addEos(serviceLocation,eosId){
    var zookeeper = serviceLocation.zookeeper;
    var path = EOS_STATE;
    zookeeper.getData(path + "/"+ eosId,function (event) {
            console.log('Got path of %s data event: %s.',path, event);
        },
        function (error, data, stat) {
            if (error) {
                console.log(error.stack);
                return;
            }
            var ipPort = data.toString('utf8');
            console.log('Got online EOS data: %s',ipPort) ;
            var eosObj = {
                eos_ip:ipPort.split(":")[0],
                eos_port:ipPort.split(":")[1],
                services:{}
            };
            serviceLocation.eosMap[eosId] = eosObj;
            updateService(serviceLocation,eosId);
        });
}
function removeEos(serviceLocation,eosId){
    //判断EOS是否在线
    serviceLocation.zookeeper.exists(EOS_STATE + "/" + eosId,function(error, stat){
        if (error) {
            console.log(error.stack);
            return;
        }
        if (!stat) {
            delete serviceLocation.eosMap[eosId];
        }
    });
}
function updateService(serviceLocation,eosId){
    var zookeeper = serviceLocation.zookeeper;
    var path = SERVICE_STATE;
    zookeeper.getChildren(path + "/" + eosId,function (event) {
//            console.log('Got path of %s watcher event: %s', path,event);
            updateService(serviceLocation,eosId);
        },
        function (error, children, stat) {
            if (error) {
                console.log(
                    'Failed to list eos node of %s due to: %s.',
                    path,
                    error
                );
                return;
            }

            var realOnline = [];
            //处理online
            _.each(children,function(servicePath){
                var i = servicePath.lastIndexOf("_");
                var real = servicePath.substring(0, i);
                realOnline.push(real);
            });
            var eos = serviceLocation.eosMap[eosId];
            if(_.isUndefined(eos)){
                return;
            }
            var services = eos["services"];
            _.each(realOnline,function(online){
                if (!_.has(services,online)) {
                    console.log("Service:" + online + " online ");
                    services[online] = "AA";
                }
            });
            for (var service in services) {
                if (!_.contains(realOnline,service)) {
                    console.log("Service:%s offline.",service);
                    delete services[service];
                }
            }
        });
}

function createServiceLocation(ip,port,excludeEos){
    return new ServiceLocation(ip,port,excludeEos);
}

module.exports.createServiceLocation = createServiceLocation;