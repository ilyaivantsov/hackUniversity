//функция для выведения лога сразу в HTML
function log(str) {
  document.getElementById("log").innerHTML += str+"<br/>";
}

log("N.I.N.");
// Инициализация VoxImplant 
var voxAPI = VoxImplant.getInstance();
// Обработчики событий
voxAPI.on(VoxImplant.Events.SDKReady, onSdkReady);
voxAPI.on(VoxImplant.Events.ConnectionEstablished, onConnectionEstablished);
voxAPI.on(VoxImplant.Events.ConnectionFailed, onConnectionFailed);
voxAPI.on(VoxImplant.Events.ConnectionClosed, onConnectionClosed);
voxAPI.on(VoxImplant.Events.AuthResult, onAuthResult);
voxAPI.on(VoxImplant.Events.IncomingCall, onIncomingCall);
voxAPI.on(VoxImplant.Events.MicAccessResult, onMicAccessResult);
voxAPI.on(VoxImplant.Events.SourcesInfoUpdated, onSourcesInfoUpdated);

// Инициализуем SDK
try {
    voxAPI.init({ 
        micRequired: true,                         // запрос доступа к микрофону/камере до подключения к VoxImplant
        videoSupport: true ,                              // включить поддержку видео
        progressTone: true,                              // проигрывать progress tone
        localVideoContainerId: "voximplant_container",   // id элемента куда вставляется  local video с камеры
        remoteVideoContainerId: "voximplant_container"   // id элемента куда вставляется  remote video с камеры
    });
} catch(e) {
    // если произошла ошибка инициализации, то выводим ее
    log(e.message);
}

// Теперь можно пользоваться SDK - подключаемся
function onSdkReady(){        
    voxAPI.connect(); // после вызова появится диалог доступа к камере/микрофону
}


 // Установили соединение с VoxImplant
function onConnectionEstablished() {
    // Можно авторизоваться - тут надо показать диалог для ввода данных, а потом вызвать следующую функцию
    // Замените application_user, application_name, account_name и application_user_password на ваши данные для тестирования
    var application_name='videochat',
    account_name='ivantsov';
    var username = 'ilya',
    password = 'qwertyqwe';// Данные аккаунта на Vox см. приложения 
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

// Обработка результата авторизации авторизации
function onAuthResult(e) {
  log("AuthResult: "+e.result);
  if (e.result) { 
    // Authorized successfully         
    log("AuthResult: "+e.result);
    showLocalVideo(true);      
  } else {
    // Wrong username or password

    log("Code: "+e.code);
  }
}



// Входящий вызов
function onIncomingCall(e) {
  currentCall = e.call;
  // Обработчики событий
  currentCall.on(VoxImplant.CallEvents.Connected, onCallConnected);
  currentCall.on(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
  currentCall.on(VoxImplant.CallEvents.Failed, onCallFailed);
  currentCall.on(VoxImplant.CallEvents.MediaElementCreated, onMediaElement);
  currentCall.on(VoxImplant.CallEvents.LocalVideoStreamAdded, onLocalVideoStream);
  log("Incoming call from: "+currentCall.number());
  // Обработка ответа на входящий вызов
  currentCall.answer(null, {}, { receiveVideo: true, sendVideo: true });
}



// Обрабатываем
function onMicAccessResult(e) {
	  log("Mic/Cam access allowed: "+e.result);
    if (e.result) {
        // разрешили доступ к камере/микрофону

    } else {
        // запретили доступ к камере/микрофону

 }
}

function onSourcesInfoUpdated() {
  var audioSources = voxAPI.audioSources(),
      videoSources = voxAPI.videoSources();
}

// Show/hide local video
function showLocalVideo(flag) {
  voxAPI.showLocalVideo(flag);
}



// Создание тега video для входящего звонка
function onMediaElement(e) {
  // For WebRTC just using JS/CSS for transformation
  $video = $(e.element);
  $video.appendTo('#voximplant_container');
  $video.css('margin-left', '10px').css('width', '320px').css('height', '240px').css('float', 'left');
  $video[0].play();
}
