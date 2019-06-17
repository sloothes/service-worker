//  demo-sw.js

    self.version = 1.3;

    var debugMode = true;


//  "importScripts()" being called from inside the worker's inner scope.
//  "importScripts()" and "self.importScripts()" are equivalent & both represent.

//  CREATE INDEXED (ZANGO) DB.

    self.importScripts(
        "/scene/js/Objectid.js",
        "/scene/js/zangodb.min.js",
        "/scene/js/AW3D.db.js",
    );

//  OUTFIT URLS.

    var skinned = {};

    skinned.male = [
        "/skinned/male/body.json",
        "/skinned/male/eyes.json",
        "/skinned/male/hairs.json",
        "/skinned/male/underwears.json",
        "/skinned/male/costume.json",
        "/skinned/male/trousers.json",
        "/skinned/male/shoes.json",
    ];

    skinned.female = [
        "/skinned/female/body.json",
        "/skinned/female/eyes.json",
        "/skinned/female/hairs.json",
        "/skinned/female/stockings.json",
        "/skinned/female/underwears.json",
        "/skinned/female/dress.json",
        "/skinned/female/costume.json",
        "/skinned/female/trousers.json",
        "/skinned/female/shoes.json",
    ];

    skinned.skeleton = [
        "/skinned/skeleton/bones.json",
        "/skinned/skeleton/skeleton.json",
    ];

//  CACHE OUTFIT FILES.

    async function cacheOutfits(options){
        caches.open(options.name).then(function(cache){
            cache.addAll( options.URLS );
        });
    }

//  INSTALL OUTFITS TO INDEXED DB.

    async function installOutfits(options){

        var cache = await caches.open(options.name)
        .then(async function(cache){ return cache; });

        await cache.addAll( options.URLS );

        var collection = db.collection(options.name);

        for (var i=0; i < options.URLS.length; i++) {

            var json = await caches.match(options.URLS[i])
            .then(function(response){
                return response.json();
            }).then(async function(json){
                return json;
            });

            json.sourceFile = options.URLS[i]; // important!

                //  "json._id" must included in json.

            var result = await collection.findOne({_id:json._id}, function(err){
                if (err) throw err;
            }).then(async function(result){ 
                return result; 
            });

            if (result) {

                //  debugMode && console.log({"found":result._id});

                await collection.update({_id:json._id}, {$set:json}, function(err){
                    if (err) throw err;
                }).catch(function(err){
                    console.error(err);
                });

                debugMode && console.log({"updated":json._id});

            } else {

                await collection.insert(json, function(err){
                    if (err) throw err;
                }).catch(function(err){
                    console.error(err);
                });

                debugMode && console.log({"inderted":json._id});

            }

        }

    }

//  ANIMATION URLS.

    var animations = {};

    animations.basic = [
        "/animations/basic/idle.json",
        "/animations/basic/walk.json",
        "/animations/basic/run.json",
        "/animations/basic/jump.json",
    ];

    animations.male = [
        "/animations/male/idle.json",
        "/animations/male/walk.json",
        "/animations/male/run.json",
        "/animations/male/jump.json",
    ];

    animations.female = [
        "/animations/female/idle.json",
        "/animations/female/walk.json",
        "/animations/female/run.json",
        "/animations/female/jump.json",
    ];

//  CACHE ANIMATIONS FILES.

    async function cacheAnimations(options){
        caches.open(options.name).then(function(cache){
            return cache.addAll( options.URLS );
        });
    }

//  INSTALL ANIMATIONS TO INDEXED DB.

    async function installAnimations(options){

        var cache = await caches.open(options.name)
        .then(async function(cache){
            return cache;
        });

        await cache.addAll( options.URLS );

        var doc = {_id:options._id}; // important!
        var collection = db.collection(options.name);

        for (var i=0; i < options.URLS.length; i++){

            var json = await caches.match(options.URLS[i])
            .then(function(response){
                return response.json();
            }).then(function(json){
                return json;
            });

            doc[json.name] = json;
        }

        var result = await collection.findOne({_id:doc._id}, function(err){
            if (err) throw err;
        }).then(async function(result){ 
            return result; 
        });

        if (result) {

        //  debugMode && console.log({"found":result._id});

            await collection.update({_id:doc._id}, {$set:doc}, function(err){
                if (err) throw err;
            }).catch(function(err){
                console.error(err);
            });

            debugMode && console.log({"updated":doc._id});

        } else {

            await collection.insert(doc, function(err){
                if (err) throw err;
            }).catch(function(err){
                console.error(err);
            });

            debugMode && console.log({"inserted":doc._id});

        }

    }

//  INSTALL MATERIALS TO INDEXED DB.

    async function installMaterials(url){

        var docs = await fetch(url)
        .then(function(response){
            return response.json();
        }).then(function(json){
            return json;
        });

        var collection = db.collection("materials");
        debugMode && console.log({"materials":docs});

        for (var i=0; i < docs.length; i++){

            var doc = docs[i];

            var result = await collection.findOne({_id:doc._id}, function(err){
                if (err) throw err;
            }).then(async function(result){ 
                return result; 
            });

            if (result) {

                await collection.update({_id:doc._id}, {$set:doc}, function(err){
                    if (err) throw err;
                }).catch(function(err){
                    console.error(err);
                });

                debugMode && console.log({"updated":doc._id});

            } else {

                await db.collection("materials").insert(doc, function(err){
                    if (err) throw err;
                }).catch(function(err){
                    console.error(err);
                });

                debugMode && console.log({"inserted":doc._id});

            }

        }

    }

//  Install.

    install();

    async function install(){

        await installOutfits({
            name:"male",
            URLS: skinned.male,
        });

        await installOutfits({
            name:"female",
            URLS: skinned.female,
        });

        await installOutfits({
            name:"skeleton",
            URLS: skinned.skeleton,
        });


        await installAnimations({
            _id:"basic",
            name:"animations",
            URLS:animations.basic,
        });

        await installAnimations({
            _id:"male",
            name:"animations",
            URLS:animations.male,
        });

        await installAnimations({
            _id:"female",
            name:"animations",
            URLS:animations.female,
        });

        await installMaterials("/AW3D_db/v3.5/materials.json");

        activate();

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











//  INSTALLATION.
/*
    self.addEventListener("install", async function(e){

        self.skipWaiting();

    });


//  ACTIVATION.

    self.addEventListener("activate", async function(e){

        self.clients.claim();

    });
*/

//  FETCH REQUEST.
/*
    self.addEventListener("fetch", async function(e){

    //  Cache first.

        e.respondWith(

            caches.match( e.request ).then( function(response){

                if ( !response ) debugMode && console.log("[fetch request]:", e.request.url);

                return response || fetch(e.request);

            })

        );

    });
*/


/*
//  ACTIVATION.
//  Service worker takes Immediatly the control of pages.
    self.addEventListener("activate", async function(e){

    //  self.clients.claim();
    //  takes Immediatly the control all of pages in scope.

    //  or...

        self.clients.matchAll().then(function(clients){

            clients[0].claim();
        //  take immediatly control of first client.
            
            client = clients[0];
            console.log({"client": client});

        });

    });
*/

//  SELF DESTOYING ACTIVATION.
/*
//  Self-destroying ServiceWorker.
//  removing ServiceWorker from a websiste.
//  source: "https://github.com/NekR/self-destroying-sw"
//  source: "https://medium.com/@nekrtemplar/self-destroying-serviceworker-73d62921d717"

    self.addEventListener("activate", async function(e){

    //  Unistall service worker.
        self.registration.unregister().then(function() {

            return self.clients.matchAll();

        }).then(function(clients) {

            clients.forEach(function(client){
                client.navigate(client.url);
            });

        });

    });
*/

//  FETCH EVENT LISTENER.
/*
    self.addEventListener("fetch", async function(e){

    //  Cache first.

        e.respondWith(

            caches.match( e.request ).then( function(response){

                if ( !response )
                    debugMode && console.log("[scene request]:", e.request.url);

                return response || fetch(e.request);

            })

        );

    });

*/
/*

//  three.js editor cache first sw example:
//  source from: "https://github.com/mrdoob/three.js/blob/master/editor/sw.js"

    self.addEventListener( "fetch", async function ( event ) {

        const request = event.request;
        event.respondWith( cacheFirst( request ) );

    } );

    async function cacheFirst( request ) {

        const cachedResponse = await caches.match( request );
        return cachedResponse || fetch( request );

    }
*/









