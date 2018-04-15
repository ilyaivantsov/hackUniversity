var username = getCookie('username'),
    password = getCookie('password'),
    application_name = 'videochat',
    account_name = 'ivantsov',
    dialog;

// create VoxImplant instance
var voxAPI = VoxImplant.getInstance();
// assign handlers
voxAPI.on(VoxImplant.Events.SDKReady, onSdkReady);
voxAPI.on(VoxImplant.Events.ConnectionEstablished, onConnectionEstablished);
voxAPI.on(VoxImplant.Events.ConnectionFailed, onConnectionFailed);
voxAPI.on(VoxImplant.Events.ConnectionClosed, onConnectionClosed);
voxAPI.on(VoxImplant.Events.AuthResult, onAuthResult);

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

$('#auth').click(function() {
	dialog.open();
});

try {
  voxAPI.init({
    videoSupport: true,        // enable video support 
    micRequired:  true        // force microphone/camera access request
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
// Establish connection with VoxImplant
function connect() {
  console.log("Establishing connection...");
  voxAPI.connect();
}

function onConnectionEstablished() {

var $authForm = $('<div id="authForm">'+
    '<form class="form-horizontal" role="form">'+
    '<div class="form-group">'+
      '<label for="inputUsername" class="col-sm-2 control-label">Логин</label>'+
      '<div class="col-sm-10">'+
        '<input type="text" class="form-control" id="inputUsername" placeholder="Выберите username">'+
      '</div>'+
    '</div>'+
    '<div class="form-group">'+
      '<label for="inputPassword" class="col-sm-2 control-label">Пароль</label>'+
      '<div class="col-sm-10">'+
        '<input type="password" class="form-control" id="inputPassword" placeholder="Пароль">'+
      '</div>'+
    '</div>'+
    '<input type="submit" value="submit" class="hidden" />'+
  '</form>'+
  '</div>');
if (typeof username == 'undefined' || typeof password == 'undefined') {
    dialog = new BootstrapDialog({
      title: 'Авторизация',
      message: $authForm,
      buttons: [{
            label: 'Вход',
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
          authUserVox(username,password);
          login();
          e.preventDefault();
        });
      }
    });
   // dialog.open();
  } else login();
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
    // Authorized successfully         
    $('#auth').replaceWith('<a href="https://spbchooseus.ru/hack/customer" class="btn btn-lg btn-default" id="customer">Я заказчик</a><a href="https://spbchooseus.ru/hack/executor" class="btn btn-lg btn-default" id="executor" style="margin-left:10px">Я исполнитель</a>');
    dialog.close();
    //showLocalVideo(true);      
  } else {
    // Wrong username or password
    if (!$('div.alert.alert-danger').length) $('#authForm').prepend('<div class="alert alert-danger" role="alert">Выбрано неверное имя или пароль</div>');
    console.log("Code: "+e.code);
  }
}

function authUserVox(Username,Password){
       $.ajax({
            url:'https://spbchooseus.ru/v2/php/add_new_user-vox.php',    // абсолютные пути
            type:'POST',
            async:false,
            data: {username:Username,password:Password},
            success: function(res) {
                ans = JSON.parse(res);
                username = ans.username;
                password = ans.password;
                document.cookie = "username=" +  username;
                document.cookie = "password="  + password;
            }
       });
}