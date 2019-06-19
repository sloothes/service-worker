    self.version = 2.0;
    var debugMode = true;

    self.importScripts(
        "/js/Objectid.js",
        "/js/zangodb.min.js",
    );


    async function installDB(url){

        var cache = await caches.open("databases")
        .then(async function(cache){ return cache; });

        await cache.add(url);

        var collections = await cache.match(url)
        .then(function(response){
            return response.json();
        }).then(function(json){
            return json;
        });

        debugMode && console.log({"collections":collections});

        var options = {};
        for (var name in collections) {
            options[ name ] = true;
        }

        debugMode && console.log({"options":options});

        var db = new zango.Db( "DEMO", options);
        await db.open(function(err, database){
            if (err) console.error(err);
        }).then( function(){
            debugMode && console.log(`Database ${db.name} (v${db.version}) ready for use.`);
        }).catch(function(err){
            console.error(err);
        });

        for (var name in collections) {

            var collection = db.collection(name);
            await collection.insert(collections[name], function(err){
                if (err) throw err;
            }).catch(function(err){
                console.error(err);
            });

        }

        return collections;

    }


//  Activate.

    function activate(){

        self.skipWaiting();

    }


//  Get Clients.

    function getClinet(){

        self.clients.matchAll().then(function(clients){

            client = clients[0];

            console.log({"client": client});

        });

    }


//  Self Unistall.

    function unistall(){

        self.registration.unregister().then(function(){

            return self.clients.matchAll();

        }).then(function(clients) {

            clients.forEach(function(client){
                client.navigate(client.url);
                console.log(`service worker unistalled from client "${client.url}"`);
            });

        });

    }


//  SERVICE WORKER EVENT LISTENERS.

    self.addEventListener("fetch", async function(e){

        caches.match( e.request ).then( function(response){

            if ( !response ) debugMode && console.log( e.request.url );

        });

    });


//  Receiving message from clients.

    self.addEventListener("message", function(e){

        debugMode && console.log({"received client data": e.data});

    });
