//  service-worker/sw.js

//  Root index page installs service workers
//  with subfolder scopes.

    var debugMode = true;
    var serviceWorker = navigator.serviceWorker;

    if ( serviceWorker ) {

    /*
    //  A test of multi-install a service worker
    //  that is belong in an in an other folder.
        serviceWorkerRegistration( serviceWorker, {
            opt: {scope: "/"},
            url: "/service-worker.js",
        });

        serviceWorkerRegistration( serviceWorker, {
            opt: {scope: "/scene/"},
            url: "/service-worker.js",
        });
    */

    //  A test of installing a service worker 
    //  without scope.
        serviceWorkerRegistration( serviceWorker, {
            opt: {scope: ":0"},
            url: "/service-worker.js",
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

