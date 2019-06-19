    self.version = 2.0;
    var debugMode = true;

    self.importScripts(
        "/js/Objectid.js",
        "/js/zangodb.min.js",
    );



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
