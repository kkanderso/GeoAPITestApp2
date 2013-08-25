(function (global) {
    
    var mobileSkin = "",
        app = global.app = global.app || {};

    var tf;
    
    var apnSuccessfulRegistration = function(token) {
        alert("Successfully got a token:" + token);
    }

    var apnFailedRegistration = function(error) {
        alert("Error: " + error.toString());
    }

    var pushNotification;

    document.addEventListener("deviceready", function () {
        
        app.application = new kendo.mobile.Application(document.body, { layout: "tabstrip-layout" });

        pushNotification = window.plugins.pushNotification;

        /*
        
        if (pushNotification == null || pushNotification == undefined)
        {
            console.log("pushNotification is null or undefined");
        }
        else
        {
            console.log("pushNotification is OK");
        }
        */
        
        Login();
	    StartWatchingLocation();

		/*        
        if (device.platform == 'android' || device.platform == 'Android') {
            pushNotification.register(successHandler, errorHandler,
          	{
				"senderID":"replace_with_sender_id",
                "ecb":"onNotificationGCM"
            });
        } else {
            pushNotification.register(tokenHandler, errorHandler, 
            {
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
        }
        */
                
    }, false);

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
    
    /*
    // result contains any message sent from the plugin call
    function successHandler (result) {
        console.log('result = '+result)
        SubscribeToPush(result);
    }
    
    // result contains any error description text returned from the plugin call
    function errorHandler (error) {
        console.log('error = '+error)
    }
     
    function tokenHandler (result) {
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
        console.log('device token = '+result)
        SubscribeToPush(result);
        
    }
    
    // iOS
    function onNotificationAPN(event) {
        if (event.alert) {
            navigator.notification.alert(event.alert);
        }
    
        if (event.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }
    
        if (event.badge) {
            pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
        }
    }


    // Android
    function onNotificationGCM(e) {
        $("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
        
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    $("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                    // Your GCM push server needs to know the regID before it can push to this device
                    // here is where you might want to send it the regID for later use.
                    console.log("regID = " + e.regID);
                }
                break;
                
            case 'message':
                // if this flag is set, this notification happened while we were in the foreground.
                // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                if (e.foreground)
                {
                    $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                    
                    // if the notification contains a soundname, play it.
                    var my_media = new Media("/android_asset/www/"+e.soundname);
                    my_media.play();
                }
                else
                {   // otherwise we were launched because the user touched a notification in the notification tray.
                    if (e.coldstart)
                        $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                    else
                        $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                }
                
                $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
                $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
                break;
                
            case 'error':
                $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
                break;
                
            default:
                $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
                break;
        }
    }    
    */
    function WatchPositionSuccess(position){

        $("#divStatus").prepend("**********************************</br>");
        $("#divStatus").prepend("Updating Position!...</br>");
        $("#divStatus").prepend(position.coords.latitude +"</br>");
        $("#divStatus").prepend(position.coords.longitude +"</br>");
        $("#divStatus").prepend(position.coords.speed +"</br>");
        $("#divStatus").prepend(position.coords.altitude +"</br>");
        $("#divStatus").prepend(position.coords.accuracy +"</br>");
        $("#divStatus").prepend(position.coords.altitudeAccuracy +"</br>");
        $("#divStatus").prepend(position.timestamp +"</br>");

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
            console.log(JSON.stringify(response));
        });
        
        request.fail(function (jqXHR, textStatus, errorThrown){
            $("#divStatus").prepend('Updating Position returned failure ' + JSON.stringify(textStatus) + ' </br>');
            $("#divStatus").prepend(jqXHR.responseText);
        });
    }
    
    function WatchPositionError(error){
            $("#divStatus").prepend('WatchPosition returned failure ' + JSON.stringify(error) + ' </br>');
    }
    
    
	function SubscribeToPush(){
        
    }
    
    function StartWatchingLocation(){

        var watchId = navigator.geolocation.watchPosition(
            WatchPositionSuccess,
            WatchPositionError,
            { maximumAge: 10000, timeout: 10000, enableHighAccuracy: true });    
    }    
    
    function Login(){
        console.log('Login start...');
        var url = "https://api.cloud.appcelerator.com/v1/users/login.json?key=j3qU2XFOTNYoDkLf9P3tg3Pf3REeHdXp";
        var method = 'POST';
        var data = {
            login: 'bp4151@gmail.com',
            password: 'Test'
        };
        
        $.ajax({
            data: data,
            dataType: 'json',
            type: 'POST',
            url: url,
            success: function(data){
                console.log('SUCCESS - ' + JSON.stringify(data));
      
            },
            error: function(data){
                console.log('FAILURE - ' + JSON.stringify(data));
            }
        });
    }
})(window)