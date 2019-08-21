//  service-worker/sw.js

    var debugMode = true;

    var serviceWorker = navigator.serviceWorker;

    if ( serviceWorker ) {

    //  serviceWorkerRegistration( serviceWorker, {
    //      opt: {scope: "/"},
    //      url: "/service-worker.js",
    //  });

        serviceWorkerRegistration( serviceWorker, {
            opt: {scope: "/scene/"},
            url: "/scene/service-worker.js",
        });

        serviceWorkerRegistration( serviceWorker, {
            opt: {scope: "/outfits/"},
            url: "/outfits/service-worker.js",
        });

    }

    function serviceWorkerRegistration( serviceWorker, options ){

        if (!serviceWorker) {
            console.warn("Oh no! "
                + "Your browser doesn't support "
                + "a feature needed to run this app "
                + "(navigator.serviceWorker).\n" 
                + "Try using a different browser.");
            return;
        }

        serviceWorker.register(options.url, options.opt).then(function (reg) {

            reg.addEventListener("statechange", function(){
                debugMode && console.log({"reg active state": reg.active.state});
            });

            reg.addEventListener("updatefound", function(){
                var newSWController = reg.installing;
                debugMode && console.log("new service worker update found:");
                newSWController.addEventListener("statechange", function(){
                    debugMode && console.log({"new sw controller state": this.state});
                    if ( this.state === "activated") { 
                        // do something //
                    }
                });
            });

        //  Refresh to activate the worker.
        //  if (!reg.active) {
        //      location.reload(); return;
        //  } 

        }).catch(function(err) { 
            console.error(err);
        });
    }


