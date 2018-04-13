var dialog,
    username,
    password,
    application_name = 'videochat',
    account_name = 'ivantsov';



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
//voxAPI.on(VoxImplant.Events.SourcesInfoUpdated, onSourcesInfoUpdated);
 
// initialize SDK
try {
  voxAPI.init({ 
    micRequired: true, // force microphone/camera access request
    videoSupport: true, // enable video support 
    progressTone: true, // play progress tone
    localVideoContainerId: "voximplant_container" // element id for local video from camera or screen sharing
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
      '<label for="inputUsername" class="col-sm-2 control-label">Username</label>'+
      '<div class="col-sm-10">'+
        '<input type="text" class="form-control" id="inputUsername" placeholder="Username">'+
      '</div>'+
    '</div>'+
    '<div class="form-group">'+
      '<label for="inputPassword" class="col-sm-2 control-label">Password</label>'+
      '<div class="col-sm-10">'+
        '<input type="password" class="form-control" id="inputPassword" placeholder="Password">'+
      '</div>'+
    '</div>'+
    '<input type="submit" value="submit" class="hidden" />'+
  '</form>'+
  '</div>');

  if (typeof username == 'undefined' || typeof password == 'undefined') {
    dialog = new BootstrapDialog({
      title: 'Authorization',
      message: $authForm,
      buttons: [{
            label: 'Sign in',
            action: function(dialog) {
              $('#authForm form').submit();
            }
        }],
      closable: false,
      onshown: function(dialog) {            
        $('#inputUsername').focus();
        $('#authForm form').on('submit', function(e) {
          username = $('#inputUsername').val();
          password = $('#inputPassword').val();
          login();
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
    var title = $('.panel-title').html() + ': logged in as ' + username;
    $('.panel-title').html(title);
    $('#controls').slideDown();
    showLocalVideo(true);      
  } else {
    // Wrong username or password
    if (!$('div.alert.alert-danger').length) $('#authForm').prepend('<div class="alert alert-danger" role="alert">Wrong username or password was specified</div>');
    log("Code: "+e.code);
  }
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
    dialog.setMessage('You have to allow access to your microphone to use the service');
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

// Incoming call
function onIncomingCall(e) {
  currentCall = e.call;
  // Add handlers
  currentCall.on(VoxImplant.CallEvents.Connected, onCallConnected);
  currentCall.on(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
  currentCall.on(VoxImplant.CallEvents.Failed, onCallFailed);
  currentCall.on(VoxImplant.CallEvents.MediaElementCreated, onMediaElement);
  //currentCall.on(VoxImplant.CallEvents.LocalVideoStreamAdded, onLocalVideoStream);
  log("Incoming call from: "+currentCall.number());
  // Answer automatically
  currentCall.answer(null, {}, { receiveVideo: true, sendVideo: true });
}

function onCallConnected(e) {          
  log("CallConnected: "+currentCall.id());
  if ($('#cancelButton').length) {
    $('#cancelButton').html('Disconnect');
  } else {    
    $('#callButton').replaceWith('<button type="button" class="btn btn-danger" id="cancelButton">Disconnect</button>');    
    $('#cancelButton').click(function() {
      currentCall.hangup();
    }); 
  }
  sendVideo(true);
  showRemoteVideo(true);  
}

// Show/hide remote video
function showRemoteVideo(flag) {
  currentCall.showRemoteVideo(flag);
}

// Start/stop sending video
function sendVideo(flag) {
  voxAPI.sendVideo(flag);
}

// Call disconnected
function onCallDisconnected(e) {
  log("CallDisconnected: "+currentCall.id()+" Call state: "+currentCall.state());
  currentCall = null;
  $('#cancelButton').replaceWith('<button type="button" class="btn btn-success" id="callButton">Call</button>');
  $('#cancelButton, #shareButton').remove();
  $('#callButton').click(function() {
    createCall();
  });
}

// Call failed
function onCallFailed(e) {
  log("CallFailed: "+currentCall.id()+" code: "+e.code+" reason: "+e.reason);
  $('#cancelButton').replaceWith('<button type="button" class="btn btn-success" id="callButton">Call</button>');
  $('#cancelButton').remove();
  $('#callButton').click(function() {
    createCall();
  });
}

function createCall() {
  $('#callButton').replaceWith('<button type="button" class="btn btn-danger" id="cancelButton">Cancel</button>');
  $('#callButton').remove();
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

function onMediaElement(e) {
  // For WebRTC just using JS/CSS for transformation
  $video = $(e.element);
  $video.appendTo('#voximplant_container-income');
  //$video.css('margin-left', '10px').css('width', '320px').css('height', '240px').css('float', 'left');
  $video[0].play();
}

