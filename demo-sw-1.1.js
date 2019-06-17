//  demo-sw.js

    self.version = 1.1;
    var debugMode = true;

//  "importScripts()" being called from inside the worker's inner scope.
//  "importScripts()" and "self.importScripts()" are equivalent & both represent.

//  INDEXED (ZANGO DB).

    importScripts(
        "/scene/js/Objectid.js",
        "/scene/js/zangodb.min.js",
        "/scene/js/AW3D.db.js",
    );

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

    async function cacheOutfits(options){

        var cache = await caches.open(options.name)
        .then(function(cache){
            return cache.addAll( options.URLS );
        });
    }

    async function installOutfits(options){

        var collection = db.collection(options.name);

        options.URLS.forEach(function(url){
            caches.match(url).then(function(response){
                return response.json();
            }).then(function(json){

                collection.insert(json, function(err){
                    if (err) throw err;
                }).catch(function(err){
                    console.error(err);
                });

            });
        });
    }

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

    async function cacheAnimations(options){

        var cache = await caches.open(options.name)
        .then(function(cache){
            return cache.addAll( options.URLS );
        });

    }

    async function installAnimations(options){

        var doc = {_id:options._id};

        for (var i=0; i < options.URLS.length; i++){
            await caches.match(options.URLS[i])
            .then(function(response){
                return response.json();
            }).then(function(json){
                doc[json.name] = json;
            });
        }

        debugMode && console.log({"doc":doc});

        var collection = db.collection(options.name);

        collection.insert(doc, function(err){
            if (err) throw err;
        }).catch(function(err){
            console.error(err);
        });

    }


//  INSTALLATION.

    self.addEventListener("install", async function(e){

        await cacheOutfits({
            name:"male",
            URLS: skinned.male,
        });

        await cacheOutfits({
            name:"female",
            URLS: skinned.female,
        });

        await cacheOutfits({
            name:"skeleton",
            URLS: skinned.skeleton,
        });


        await cacheAnimations({
            _id:"basic",
            name:"animations",
            URLS:animations.basic,
        });

        await cacheAnimations({
            _id:"male",
            name:"animations",
            URLS:animations.male,
        });

        await cacheAnimations({
            _id:"female",
            name:"animations",
            URLS:animations.female,
        });


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

        //  self.skipWaiting();

    });

//  ACTIVATION.
//  Service worker takes Immediatly the control of pages.
    self.addEventListener("activate", async function(e){

    //  takes Immediatly the control of pages in scope.
        self.clients.claim();
    });


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

























