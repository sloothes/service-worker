//  service-worker.js

    self.version = 3.5;
    var debugMode = true;

    self.importScripts(
        "/js/Objectid.js",
        "/js/zangodb.min.js",
        "/socketcluster.js",
        "/sc-codec-min-bin.js",
    );

    var socket = socketCluster.create({
        hostname: "anywhere3d.com",
        codecEngine: scCodecMinBin,
    });

//  IMPORTANT: service worker socket "authState" always is
//  "unauthenticated" as dont have access to localStorage.

    socket.on("connect", function(status){
        debugMode && console.log("[service-worker]:", {"status": status});
    });

    socket.on("error", function (err) {
        console.error( "[service-worker]:", err );
    });

    socket.on("authStateChange", function( state ){
        debugMode && console.log("[service-worker]:", {"authStateChange": state});
    });

    self.addEventListener("install", function(e){
        debugMode && console.log("service worker installed.");

        install().then(activate);

    });

    self.addEventListener("activate", function(e){
        debugMode && console.log("service worker activated.");

        clientClaim();

    });

    var PUBLIC = new zango.Db( "PUBLIC", {
        "avatars": true,
    });

    function install(){

        return PUBLIC.open(function(err, db){
            if (err) console.error(err);
        }).then( function(db){
            debugMode && console.log(
                `Database ${db.name} (v${db.version}) ready for install.`);
        }).catch(function(err){
            console.error(err); throw err;
        }).then(function(){

            return new Promise(resolve, reject){
                socket.emit("mongo find", {
                    collection:"onsite-avatars",
                    selectors: {"kind":"outfits"},
                }, function(err, data){
                    if (err) console.error(err);
                    resolve(data);
                });
            });

        }).then(function(data){
            debugMode && console.log(data);

            var collection = PUBLIC.collection("avatars");
            return collection.insert(data, function(err){
                if (err) throw err;
            }).then(function(results){
                debugMode && console.log(results);
            }).catch(function(err){
                console.error(err);
            });

        }).catch(function(err){
            console.error(err);
        });
    }

    function activate(){
        debugMode && console.log("activating...");
        self.skipWaiting();
    }

    function clientClaim(){
        debugMode && console.log("claiming...");
        self.clients.claim();
    }
