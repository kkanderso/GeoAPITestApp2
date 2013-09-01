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
    
    document.addEventListener("deviceready", function () {
        
        app.application = new kendo.mobile.Application(document.body, { layout: "tabstrip-layout" });
        
        Login();
		
        /*
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        */
                
        StartWatchingLocation();
     
    }, false);
        
/*
    function onPause() {
    // Handle the pause event
        acquire();
	}
    
    function onResume() {
        release();
    }
   	 
    function acquire() {
            cordova.require('cordova/plugin/powermanagement').acquire(
                    function() { alert( 'successfully acquired full wake lock' ); },
                    function() { alert( 'error acquiring full wake lock' ); }
                    );
    }
    
    function release() {      
            cordova.require('cordova/plugin/powermanagement').release(
                    function() { alert( 'successfully released full wake lock' ); },
                    function() { alert( 'error releasing full wake lock' ); }
                    );
        
    }
    */
        
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

    var onAndroidPushReceived = function(args) {
        alert('Android notification received: ' + JSON.stringify(args)); 
    };
    
    var onIosPushReceived = function(args) {
        alert('iOS notification received: ' + JSON.stringify(args)); 
    };
        
    function WatchPositionSuccess(position){

        $("#divStatus").prepend("**********************************</br>");
        $("#divStatus").prepend("Updating Position " + idxLocation + "!...</br>");
        $("#divStatus").prepend(position.coords.latitude +"</br>");
        $("#divStatus").prepend(position.coords.longitude +"</br>");
        $("#divStatus").prepend(position.coords.speed +"</br>");
        $("#divStatus").prepend(position.coords.altitude +"</br>");
        $("#divStatus").prepend(position.coords.accuracy +"</br>");
        $("#divStatus").prepend(position.coords.altitudeAccuracy +"</br>");
        $("#divStatus").prepend(position.timestamp +"</br>");

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

        var watchId = navigator.geolocation.watchPosition(
            WatchPositionSuccess,
            WatchPositionError,
            { maximumAge: 10000, timeout: 10000, enableHighAccuracy: true });    
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
                senderID: 1096136230769
            },
            notificationCallbackIOS : onIosPushReceived,
            notificationCallbackAndroid : onAndroidPushReceived
        };   
        
        el.push.currentDevice().enableNotifications(pushSettings, 
            function(e){
                alert('enabled');
                el.push.currentDevice().getRegistration(function(){
                    console.log('Device already registered...');
                },
                function(){
                    
                    el.push.currentDevice().register(null, 
                        function(e){
                            alert('registered for push ' + e);
                        }, function(error){
                            alert('register for push failed ' + JSON.stringify(error));
                    });                
                });                
            }, 
            function(error){
                alert('push enable failed ' + error); 
            }
        );

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