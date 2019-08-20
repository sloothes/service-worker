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

        activate();

    });

    self.addEventListener("activate", function(e){
        debugMode && console.log("service worker activated.");

        clientClaim();

    });

    function activate(){
        debugMode && console.log("activating...");
        self.skipWaiting();
    }

    function clientClaim(){
        debugMode && console.log("claiming...");
        self.clients.claim();
    }
