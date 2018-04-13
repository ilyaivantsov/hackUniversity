var params = getHashParams(),
    mode = typeof(params.mode)=='undefined'?'webrtc':params.mode,
    username = getCookie("username"),
    password = getCookie("password"),
    first_name = getCookie("first_name"),
    last_name = getCookie("last_name"),
    application_name = 'videochat',
    account_name = 'ivantsov',
    dialog,
    showLog = true,
    currentCall = null,
    outboundCall = null;

// Получить cookie
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function getHashParams() {
  var hashParams = {};
  var e,
      a = /\+/g,  // Regex for replacing addition symbol with a space
      r = /([^&;=]+)=?([^&;]*)/g,
      d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
      q = window.location.hash.substring(1);

  while (e = r.exec(q))
     hashParams[d(e[1])] = d(e[2]);

  return hashParams;
}

function log(str) {
  document.getElementById("log").innerHTML += str+"<br/>";
}

// create VoxImplant instance
var voxAPI = VoxImplant.getInstance();
// assign handlers
voxAPI.on(VoxImplant.Events.SDKReady, onSdkReady);
voxAPI.on(VoxImplant.Events.ConnectionEstablished, onConnectionEstablished);
voxAPI.on(VoxImplant.Events.ConnectionFailed, onConnectionFailed);
voxAPI.on(VoxImplant.Events.ConnectionClosed, onConnectionClosed);
voxAPI.on(VoxImplant.Events.AuthResult, onAuthResult);
voxAPI.on(VoxImplant.Events.IncomingCall, onIncomingCall);
voxAPI.on(VoxImplant.Events.MicAccessResult, onMicAccessResult);
voxAPI.on(VoxImplant.Events.SourcesInfoUpdated, onSourcesInfoUpdated);
 
// initialize SDK
try {
  voxAPI.init({ 
    micRequired: true, // force microphone/camera access request
    videoSupport: true, // enable video support 
    progressTone: true, // play progress tone
    localVideoContainerId: "voximplant_container", // element id for local video from camera or screen sharing
    remoteVideoContainerId: "voximplant_container"
  });
} catch(e) {
  log(e);
}

// SDK ready - functions can be called now
function onSdkReady(){        
  log("onSDKReady version "+VoxImplant.version);
  log("WebRTC supported: "+voxAPI.isRTCsupported()); 
  connect();
}

// Connection with VoxImplant established
function onConnectionEstablished() {
  log("Connection established: "+voxAPI.connected());

  // show authorization form
  var $authForm = $('<div id="authForm">'+
    '<form class="form-horizontal" role="form">'+
    '<div class="form-group">'+
      '<label for="inputUsername" class="col-sm-2 control-label">Зайти через вк</label>'+
    '</div>'+
    '<input type="submit" value="submit" class="hidden" />'+
  '</form>'+
  '</div>');

  if (typeof username == 'undefined' || typeof password == 'undefined') {
    dialog = new BootstrapDialog({
      title: 'Авторизация через ВК',
      message: $authForm,
      buttons: [{
            label: 'Войти',
            action: function(dialog) {
              $('#authForm form').submit();
            }
        }],
      closable: false,
      onshown: function(dialog) {    
        $('#authForm form').on('submit', function(e) {
          VK.Auth.login(function(res){
                var user = res.session.user;
                authUserVox(user.id,'qwertyqwe'); ///передаем id и пароль
                first-name = user.first_name;
                last_name =  user.last_name[0];
                document.cookie = "first-name=" + first-name;
                document.cookie = "last_name" + last_name;
                login();
              });
          e.preventDefault();
        });
      }
    });
    dialog.open();                 
  } else login();
}

// Login function
function login() {
  log(username+"@"+application_name+"."+account_name+".voximplant.com");
  voxAPI.login(username+"@"+application_name+"."+account_name+".voximplant.com", password);
}

// Connection with VoxImplant failed
function onConnectionFailed() {
  log("Connection failed");
  setTimeout(function() {voxAPI.connect();}, 1000);
}

// Connection with VoxImplant closed
function onConnectionClosed() {
  log("Connection closed");
  setTimeout(function() {voxAPI.connect();}, 1000);
}

// Handle authorization result
function onAuthResult(e) {
  log("AuthResult: "+e.result);
  if (e.result) { 
    // Authorized successfully         
    dialog.close();
    var title = $('.panel-title').html() + ': logged in as ' + first_name;
    $('.panel-title').html(title);
    showLocalVideo(true);      
  } else {
    // Wrong username or password
    if (!$('div.alert.alert-danger').length) $('#authForm').prepend('<div class="alert alert-danger" role="alert">Wrong username or password was specified</div>');
    log("Code: "+e.code);
  }
}

// Call's media element created
function onMediaElement(e) {
  // For WebRTC just using JS/CSS for transformation
  $video = $(e.element);
  $video.appendTo('#voximplant_container-remote');
  //$video.css('margin-left', '10px').css('width', '320px').css('height', '240px').css('float', 'left');
  $video[0].play();
}

// Call connected
function onCallConnected(e) {          
  log("CallConnected: "+currentCall.id());
  $('#callButton').replaceWith('<button type="button" class="btn btn-danger" id="cancelButton">Disconnect</button>');

  $('#cancelButton').click(function() {
      currentCall.hangup();
   }); 
  sendVideo(true);
  showRemoteVideo(true);  
}

// Call disconnected
function onCallDisconnected(e) {
  log("CallDisconnected: "+currentCall.id()+" Call state: "+currentCall.state());
  currentCall = null;
  $('#cancelButton').replaceWith('<button type="button" class="btn btn-success" id="callButton">Call</button>');
  $('#callButton').click(function() {
    createCall();
  });
}

// Call failed
function onCallFailed(e) {
  log("CallFailed: "+currentCall.id()+" code: "+e.code+" reason: "+e.reason);
  $('#cancelButton').replaceWith('<button type="button" class="btn btn-success" id="callButton">Call</button>');
  $('#callButton').click(function() {
    createCall();
  });
}

// Audio & video sources info available
function onSourcesInfoUpdated() {
  var audioSources = voxAPI.audioSources(),
      videoSources = voxAPI.videoSources();
}

// Camera/mic access result
function onMicAccessResult(e) {
  log("Mic/Cam access allowed: "+e.result);
  if (e.result) {       
    // Access was allowed   
    if (mode == 'webrtc') dialog.close();  
  } else {
    // Access was denied
    $('div.bootstrap-dialog').addClass('type-danger');
    dialog.setMessage('Разрешите доступ к микрофону и камере');
  }
}

// Incoming call
function onIncomingCall(e) {
  currentCall = e.call;
  // Add handlers
  currentCall.on(VoxImplant.CallEvents.Connected, onCallConnected);
  currentCall.on(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
  currentCall.on(VoxImplant.CallEvents.Failed, onCallFailed);
  currentCall.on(VoxImplant.CallEvents.MediaElementCreated, onMediaElement);
  currentCall.on(VoxImplant.CallEvents.LocalVideoStreamAdded, onLocalVideoStream);
  log("Incoming call from: "+currentCall.number());
  // Answer automatically
  currentCall.answer(null, {}, { receiveVideo: true, sendVideo: true });
}

// Progress tone play start
function onProgressToneStart(e) {
  log("ProgessToneStart for call id: "+currentCall.id()); 
}

// Progres tone play stop
function onProgressToneStop(e) {
  log("ProgessToneStop for call id: "+currentCall.id());  
}

// Create outbound call
function createCall() {
  $('#callButton').replaceWith('<button type="button" class="btn btn-danger" id="cancelButton">Cancel</button>');
  $('#cancelButton').click(function() {
    currentCall.hangup();
  });
  log("Calling to "+document.getElementById('phonenum').value);
  outboundCall = currentCall = voxAPI.call(
    document.getElementById('phonenum').value, 
    { receiveVideo: true, sendVideo: true }, 
    "TEST CUSTOM DATA"
  );
  currentCall.on(VoxImplant.CallEvents.Connected, onCallConnected);
  currentCall.on(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
  currentCall.on(VoxImplant.CallEvents.Failed, onCallFailed);
  currentCall.on(VoxImplant.CallEvents.MediaElementCreated, onMediaElement);
  //currentCall.on(VoxImplant.CallEvents.LocalVideoStreamAdded, onLocalVideoStream);
}

// Disconnect current call
function disconnectCall() {
  if (currentCall != null) {        
    log("Disconnect");
    currentCall.hangup();
  }
} 

// Close connection with VoxImplant      
function closeConnection() {
  voxAPI.disconnect();
}

// Establish connection with VoxImplant
function connect() {
  log("Establishing connection...");
  voxAPI.connect();
  if (mode == 'webrtc' && voxAPI.isRTCsupported()) {
    dialog = new BootstrapDialog({
      title: 'Camera/Microphone access',
      message: 'Please click Allow to allow access to your camera and microphone',
      closable: false      
    });
    dialog.open();  
  }
}

// Show/hide local video
function showLocalVideo(flag) {
  voxAPI.showLocalVideo(flag);
}

// Show/hide remote video
function showRemoteVideo(flag) {
  currentCall.showRemoteVideo(flag);
}

// Start/stop sending video
function sendVideo(flag) {
  voxAPI.sendVideo(flag);
}

function authUserVox(Username,Password){
  var obj={username:Username,password:Password};
       $.ajax({
            url:'../php/add_new_user-vox.php', // абсолютные пути
            type:'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async:false,
            data: JSON.stringify(obj),
            success: function(res) {
                username = res.first_name;
                password = res.password;
                document.cookie = "username=" +  res.first_name; 
                //document.cookie = "last_name=" + res.last_name;
                document.cookie = "password="  + res.password;
            }
       });
}