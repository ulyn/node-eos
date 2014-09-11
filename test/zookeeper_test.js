var zookeeper = require('node-zookeeper-client');

var client = zookeeper.createClient('localhost:2181');
var path = "/EOS_STATE";

function listChildren(client, path) {
    client.getChildren(
        path,
        function (event) {
            console.log('Got watcher event: %s', event);
            listChildren(client, path);
        },
        function (error, children, stat) {
            if (error) {
                console.log(
                    'Failed to list children of %s due to: %s.',
                    path,
                    error
                );
                return;
            }

            console.log('Children of %s are: %j.', path, children);

            for(var i in children){
//                addEos(children[i]);
            }
        }
    );
}
function addEos(eosId){
    //判断EOS是否在线
    client.getData(path + "/"+ eosId,function (event) {
            console.log('Got eos_state path data event: %s.', event);
        },
        function (error, data, stat) {
            if (error) {
                console.log(error.stack);
                return;
            }

            console.log('Got data: %s', data.toString('utf8'));
        });
    client.getChildren("/SERVICE_STATE/" + eosId,function (event) {
        console.log('Got service_state path data event: %s.', event);
    },function (error,children, stat) {
        if (error) {
            console.log(error.stack);
            return;
        }
        console.log('Children of /SERVICE_STATE/%s are: %j.', eosId, children);

        for(var i in children){
            console.log("service %s",children[i]);
        }
    });
    client.getChildren("/SERVICE_STATE/" + eosId,function (event) {
        console.log('22222222222222222222222222: %s.', event);
    },function (error,children, stat) {
        if (error) {
            console.log(error.stack);
            return;
        }
        console.log('222222222222222222222', eosId, children);

        for(var i in children){
            console.log("222222222222222",children[i]);
        }
    });

}

client.once('connected', function () {
    console.log('Connected to ZooKeeper.');
    listChildren(client, path);
});

client.connect();

