(function (global) {
    
    'use strict';
    
    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
        alert(url + ":" + lineNumber + ": " + errorMsg);
        return false;
    }
    
    var mobileSkin = "",
        app = global.app = global.app || {};
    
    var el = new Everlive({apiKey: 'sKoj4kDemFDI0Pjl'});

    var idxLocation = 0;
    
    var tf = cordova.require("cordova/plugin/testflightsdk");
    var pm = cordova.require("cordova/plugin/powermanagement");
    var isEnabled = false;
    var date = new Date();
            
    document.addEventListener("deviceready", function () {
        
        app.application = new kendo.mobile.Application(document.body, { layout: "tabstrip-layout" });
        
        /*
        tf.addCustomEnvironmentInformation(
            function(e){
    			console.log('TestflightSDK succeeded...');            
            }, 
            function(error){
            	console.log('TestflightSDK failed ' + error); 
	        }, 
            '00c9b942-6b19-40b8-84fd-ef6975289238', 'information');
		*/
        
        tf.takeOff(function(){
            console.log('Take Off Success');
        }, function(){
            console.log('Take Off Fail');
        }, '00c9b942-6b19-40b8-84fd-ef6975289238');        
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);

        Login();
		                
        StartWatchingLocation();
     
    }, false);
        
    function onPause() {
    // Handle the pause event
        pm.acquire(
            function() { console.log( 'successfully acquired full wake lock' ); },
            function() { console.log( 'error acquiring full wake lock' ); }    
        );
	}
    
    function onResume() {
        pm.release(
            function() { 
                console.log( 'successfully released full wake lock' ); 
                RegisterForPush();
            },
            function() { console.log( 'error releasing full wake lock' ); }                
        );
    }
    
    app.changeSkin = function (e) {
        if (e.sender.element.text() === "Flat") {
            e.sender.element.text("Native");
            mobileSkin = "flat";
        }
        else {
            e.sender.element.text("Flat");
            mobileSkin = "";
        }

        app.application.skin(mobileSkin);
    };

    app.sendPush = function(e) {
                
    	el.push.notifications.create(
        { 
            Message:'Hello'            
        },
        function(data){
            alert('Push Message Sent ' + JSON.stringify(data));
        },
        function(error){
            alert('Push Message Failed ' + JSON.stringify(error));
        });
    }
    
    var onAndroidPushReceived = function(args) {
        alert('Android notification received: ' + JSON.stringify(args)); 
    };
    
    var onIosPushReceived = function(args) {
        alert('iOS notification received: ' + JSON.stringify(args)); 
    };
        
    function WatchPositionSuccess(position){

        $("#divStatus").prepend("**********************************</br>");
        $("#divStatus").prepend("Updating Position " + idxLocation + "!...</br>");
        $("#divStatus").prepend("lat: " + position.coords.latitude +"</br>");
        $("#divStatus").prepend("lon: " + position.coords.longitude +"</br>");
        $("#divStatus").prepend("speed: " + position.coords.speed +"</br>");
        $("#divStatus").prepend("alt: " + position.coords.altitude +"</br>");
        $("#divStatus").prepend("accuracy: " + position.coords.accuracy +"</br>");
        $("#divStatus").prepend("alt accuracy: " + position.coords.altitudeAccuracy +"</br>");
        $("#divStatus").prepend("timestamp: " + new Date(position.timestamp) +"</br>");

        idxLocation++;
       
        $.support.cors = true;

        var request = $.ajax({
            url:'http://geoapi.jaxmeier.org/Location/Update/?format=json',
            type:'POST',
            dataType:'json',
            contentType:'application/json',
            headers: {
                "Authorization-API":"fd75ec92-9d2f-429b-9057-a2830bef9d93"
            },
            data:JSON.stringify({
//                "user_id": "520aae4a296d1e0b101c3cf5",
                "user_id": '454180c04996bb896a97334f6816a502ed9e813b302add8becb5bf9d137f2c21',
                "latitude": position.coords.latitude,
                "longitude": position.coords.longitude,
                "speed": position.coords.speed,
                "altitude": position.coords.altitude,
                "horizontal_accuracy": position.coords.accuracy,
                "vertical_accuracy": position.coords.altitudeAccuracy
            })
        });
        
        request.done(function (response, textStatus, jqXHR){
			$("#divStatus").prepend("Updating Position returned success!...</br>");
            console.log("#" + idxLocation + " " + JSON.stringify(response));
        });
        
        request.fail(function (jqXHR, textStatus, errorThrown){
            $("#divStatus").prepend('Updating Position returned failure ' + JSON.stringify(textStatus) + ' </br>');
            $("#divStatus").prepend(jqXHR.responseText);
            console.log("#" + idxLocation + " " + JSON.stringify(textStatus));
        });
    }
    
    function WatchPositionError(error){
            $("#divStatus").prepend('WatchPosition returned failure ' + JSON.stringify(error) + ' </br>');
    }
        
    function StartWatchingLocation(){

        window.setInterval(function(){
            navigator.geolocation.getCurrentPosition(WatchPositionSuccess, WatchPositionError);    
        }, 30000); 
        
        /*
        var watchId = navigator.geolocation.watchPosition(
            WatchPositionSuccess,
            WatchPositionError,
            { maximumAge: 10000, timeout: 10000, enableHighAccuracy: true });    
        */
    }    
        
    
    function RegisterForPush()
    {
        console.log('RegisterForPush called...');
        
        var pushSettings = {
            iOS:{
                badge: "true",
                sound: "true",
                alert: "true"
            },
            android:{
                senderID: '1096136230769'
            },
            notificationCallbackIOS : onIosPushReceived,
            notificationCallbackAndroid : onAndroidPushReceived
        };   
    
        if(!isEnabled)
        {
            el.push.currentDevice().enableNotifications(pushSettings, 
                function(e){
                    alert('push is now enabled');
                    isEnabled = true;
                    el.push.currentDevice().getRegistration(function(e){
                        console.log('getRegistration result: ' + JSON.stringify(e));
                        if (e.result == null)
                        {
                            el.push.currentDevice().register(null, 
                                function(e){
                                    alert('registered for push ' + JSON.stringify(e));
                                }, function(error){
                                    console.log('register for push failed ' + JSON.stringify(error));
                            });                                        
                        }
                        else
                        {
                            el.push.currentDevice().unregister(function(){
                                el.push.currentDevice().register(null, 
                                    function(e){
                                        alert('registered for push ' + JSON.stringify(e));
                                    }, function(error){
                                        console.log('register for push failed ' + JSON.stringify(error));
                                });                                                                    
                            }, function(){
                                console.log('unregister failed');
                            });
                            
                        }
                    },
                    function(){
                        console.log('Registering device...');
                        el.push.currentDevice().register(null, 
                            function(e){
                                console.log('registered for push ' + e);
                            }, function(error){
                                console.log('register for push failed ' + JSON.stringify(error));
                        });                
                    });                
                }, 
                function(error){
                    alert('push enable failed ' + error); 
                }
            );
            
        }
        else
        {
            el.push.currentDevice().getRegistration(function(e){
                alert('getRegistration result: ' + JSON.stringify(e));
                if (e.result == null)
                {
                    el.push.currentDevice().register(null, 
                    function(e){
                        alert('registered for push ' + JSON.stringify(e));
                    }, function(error){
                        console.log('register for push failed ' + JSON.stringify(error));
                    });                                        
                }
                else
                {
                    el.push.currentDevice().unregister(function(){
                        el.push.currentDevice().register(null, 
                        	function(e){
                                alert('registered for push ' + JSON.stringify(e));
                            }, function(error){
                                console.log('register for push failed ' + JSON.stringify(error));
                            });                                                                    
                    }, function(){
                        console.log('unregister failed');
                    });
                    
                }
            },
            function(){
                console.log('Registering device...');
                el.push.currentDevice().register(null, 
                	function(e){
                        console.log('registered for push ' + e);
                    }, function(error){
                        console.log('register for push failed ' + JSON.stringify(error));
                    });                
            });                
        }

    }

    
    function Login(){
        console.log('calling Login');
	
        el.Users.login('bp4151@gmail.com',
            'Test')
            .then(function(data) {
                // data.result contains an array of ojbects
                alert('LOGIN SUCCESS');
                RegisterForPush();
            },
            function(error) {
                alert(error.message);
            });
    }    
	    
})(window);