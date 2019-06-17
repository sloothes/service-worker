//  demo-sw.js

    self.version = 1.6;

    var debugMode = true;

//  "importScripts()" being called from inside the worker's inner scope.
//  "importScripts()" and "self.importScripts()" are equivalent & both represent.

    self.importScripts(
        "/js/Objectid.js",
        "/js/zangodb.min.js",
        "/js/AW3D.db.js",
        "/three/three.js",
        "/three/Animation.js",
        "/three/AnimationHandler.js",
        "/three/KeyFrameAnimation.js",
        "/AW3D_js/AW3D-dev0.3.2.js",
    );

    self.outfit = new AW3D.OutfitManager();

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

    async function cacheOutfits(options){
        caches.open(options.name).then(function(cache){
            cache.addAll( options.URLS );
        });
    }

    async function cacheAnimations(options){
        caches.open(options.name).then(function(cache){
            return cache.addAll( options.URLS );
        });
    }

    async function loadSkinnedMesh(json){

        var loader = new THREE.JSONLoader();
        var object = loader.parse( json );

        var geometry = object.geometry;
        geometry.sourceFile = json.sourceFile;  // important!

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        var material = new THREE.MeshStandardMaterial({skinning:true}); // TODO //

        var skinned =  new THREE.SkinnedMesh( geometry, material );

        skinned.renderDepth = 1;
        skinned.frustumCulled = false; // important!
        skinned.scale.set( 1, 1, 1 );
        skinned.position.set( 0, 0, 0 );
        skinned.rotation.set( 0, 0, 0 ); 

        return skinned;
    }

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

            outfit[json.name] = await loadSkinnedMesh(json);

            var object = outfit.toJSON(json.name); // important!

            var result = await collection.findOne({_id:json.name}, function(err){
                if (err) throw err;
            }).then(async function(result){ 
                return result; 
            });

            if (result) {
                
                var selector = {_id:json.name};
                var modifier = {$set:object[json.name]};

                await collection.update(selector, modifier, function(err){
                    if (err) throw err;
                }).catch(function(err){
                    console.error(err);
                });

                debugMode && console.log({"updated":json.name});

            } else {

                await collection.insert(object[json.name], function(err){
                    if (err) throw err;
                }).catch(function(err){
                    console.error(err);
                });

                debugMode && console.log({"inderted":json.name});

            }

        }

    }

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

    async function install(){

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

        activate();

    }


    function activate(){

        self.skipWaiting();

    }


    function getClinet(){

        self.clients.matchAll().then(function(clients){

            client = clients[0];

            console.log({"client": client});

        });

    }


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


    self.addEventListener("fetch", async function(e){

        caches.match( e.request ).then( function(response){

            if ( !response ) debugMode && console.log( e.request.url );

        });

    });



    self.addEventListener("message", function(e){

        debugMode && console.log({"received client data": e.data});

    });








