var params = getHashParams(),
    mode = typeof(params.mode)=='undefined'?'webrtc':params.mode,
    username = getCookie('username'),
    password = getCookie('password'),
    application_name = 'videochat',
    account_name = 'ivantsov',
    dialog,
    currentCall = null,
    outboundCall = null;

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

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
));
  return matches ? decodeURIComponent(matches[1]) : undefined;
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
    videoSupport: true,     // enable video support 
    micRequired:  true,       // force microphone/camera access request
    progressTone: true,     // play progress tone
    localVideoContainerId: "voximplant_container-local", // element id for local video from camera or screen sharing
    remoteVideoContainerId: "voximplant_container-remote"
  });
} catch(e) {
  console.log(e);
}
// SDK ready - functions can be called now
function onSdkReady(){        
  console.log("onSDKReady version "+VoxImplant.version);
  console.log("WebRTC supported: "+voxAPI.isRTCsupported()); 
  connect();
}

function onConnectionEstablished() {

if (typeof username == 'undefined' || typeof password == 'undefined') {
    console.log('Неопределено username и password');
  } 
  else login();
}

function login() {
  console.log(username+"@"+application_name+"."+account_name+".voximplant.com");
  voxAPI.login(username+"@"+application_name+"."+account_name+".voximplant.com", password);
}

// Connection with VoxImplant failed
function onConnectionFailed() {
  console.log("Connection failed");
  setTimeout(function() {voxAPI.connect();}, 1000);
}

// Connection with VoxImplant closed
function onConnectionClosed() {
  console.log("Connection closed");
  setTimeout(function() {voxAPI.connect();}, 1000);
}

// Handle authorization result
function onAuthResult(e) {
  console.log("AuthResult: "+e.result);
  if (e.result) { 
    console.log('Authorized successfully');
    showLocalVideo(true);      
  } else {
    // Wrong username or password
    console.log("Code: "+e.code+" Wrong username or password.");
  }
}

// Call's media element created
function onMediaElement(e) {
  $video = $(e.element);
  $video.appendTo('#voximplant_container-remote');
  $video.css('width', '400px').css('height', '300px');
  $video[0].play();
}

// Call connected
function onCallConnected(e) {          
  console.log("CallConnected: "+currentCall.id());
  $('#callButton').replaceWith('<button type="button" class="take_task btn btn-danger" id="cancelButton">Завершить</button>');
    $('#cancelButton').click(function() {
      currentCall.hangup();
    }); 

  sendVideo(true);
  showRemoteVideo(true);  
}

// Call disconnected
function onCallDisconnected(e) {
  сonsole.log("CallDisconnected: "+currentCall.id()+" Call state: "+currentCall.state());
  currentCall = null;
  $('#cancelButton').replaceWith('<button type="button" class="take_task btn btn-info">Выполнено</button>');
}

// Call failed
function onCallFailed(e) {
  console.log("CallFailed: "+currentCall.id()+" code: "+e.code+" reason: "+e.reason);
  $('#cancelButton').replaceWith('<button type="button" class="take_task btn btn-success" id="callButton">Взять задание</button>');
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
  console.log("Mic/Cam access allowed: "+e.result);
  if (e.result) {       
    // Access was allowed   
    if (mode == 'webrtc') dialog.close();  
  } else {
    // Access was denied
    $('div.bootstrap-dialog').addClass('type-danger');
       dialog.setMessage('Разрешите доступ к камере и микрофону');
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
  console.log("Incoming call from: "+currentCall.number());
  // Answer automatically
  currentCall.answer(null, {}, { receiveVideo: true, sendVideo: true });
}

// Progress tone play start
function onProgressToneStart(e) {
  console.log("ProgessToneStart for call id: "+currentCall.id()); 
}

// Progres tone play stop
function onProgressToneStop(e) {
  console.log("ProgessToneStop for call id: "+currentCall.id());  
}

// Create outbound call
function createCall(numcall) {
  $('#callButton').replaceWith('<button type="button" class="take_task btn btn-danger" id="cancelButton">Завершить</button>');
  $('#callButton').remove();
  $('#cancelButton').click(function() {
    currentCall.hangup();
  });
  console.log("Calling to "+numcall);
  outboundCall = currentCall = voxAPI.call(
    numcall, 
    { receiveVideo: true, sendVideo: true }, 
    "TEST CUSTOM DATA"
  );
  currentCall.on(VoxImplant.CallEvents.Connected, onCallConnected);
  currentCall.on(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
  currentCall.on(VoxImplant.CallEvents.Failed, onCallFailed);
  currentCall.on(VoxImplant.CallEvents.MediaElementCreated, onMediaElement);
}

// Disconnect current call
function disconnectCall() {
  if (currentCall != null) {        
    console.log("Disconnect");
    currentCall.hangup();
  }
} 

// Close connection with VoxImplant      
function closeConnection() {
  voxAPI.disconnect();
}

// Establish connection with VoxImplant
function connect() {
  console.log("Establishing connection...");
  voxAPI.connect();
  if (mode == 'webrtc' && voxAPI.isRTCsupported()) {
    dialog = new BootstrapDialog({
      title: 'Камера/Микрофон доступ',
      message: 'Пожалуйста разрешите доступ к камере и микрофону',
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


