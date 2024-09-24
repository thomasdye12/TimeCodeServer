// wait till page loads 

// calculate the wss host and info, if secure then use wss:// else ws://

var host = window.location.host;
const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
// if the host is addictevent.server.thomasdye.net add /api/wss to the host
// else just use the host
 host = host == 'addictevent.server.thomasdye.net' ? host + '/api/wss' : host;

const ws = new WebSocket(wsProtocol + '://' + host);

// Event listener for when the WebSocket connection is opened
ws.onopen = function () {
    console.log('WebSocket connection established');
    //  create custom event post 
    // Event listener for when the WebSocket connection is closed
    var evt = new CustomEvent('Events_Websocket_Connected', { detail: { state: 'connected' } });
    document.dispatchEvent(evt);
};

// Event listener for WebSocket errors
ws.onerror = function (error) {
    // wait 5 seconds and try to reconnect
    setTimeout(function () {
        ws = new WebSocket(wsProtocol + '://' + host);
    }, 5000);
};
ws.onmessage = function (event) {
    const message = JSON.parse(event.data);

    // Page_Newload 
    if (message.event === 'Page_Newload') {
        // wiat 5 seconds and reload page
        setTimeout(function () {
            location.reload();
        }, 5000);
    }
    // console.log(message);
    // create and post custom event
    var evt = new CustomEvent('Events_Websocket_Message', { detail: message });
    document.dispatchEvent(evt);
}
