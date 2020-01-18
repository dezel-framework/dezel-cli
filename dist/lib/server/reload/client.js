"use strict";
/**
 * @var socket
 * @since 0.1.0
 */
let socket = null;
/**
 * @function onOpen
 * @since 0.1.0
 */
function onOpen(e) {
    console.warn('[Dezel] Connected to live reload server.');
}
/**
 * @function onClose
 * @since 0.1.0
 */
function onClose(e) {
    console.warn('[Dezel] Connection closed.');
    if (e.code === 1000 ||
        e.code === 1001) {
        return;
    }
    reconnect();
}
/**
 * @function onError
 * @since 0.1.0
 */
function onError(e) {
    console.warn('[Dezel] Connection error', e);
}
/**
 * @function onMessage
 * @since 0.1.0
 */
function onMessage(event) {
    let data = event.data;
    if (data) {
        data = JSON.parse(data);
    }
    switch (data.action) {
        case 'reload':
            console.warn('[Dezel] Reloading');
            location.reload();
            break;
        case 'reload-styles':
            console.warn('[Dezel] Reloading styles');
            location.reload({ mode: 'styles' });
            break;
    }
}
/**
 * @function connect
 * @since 0.1.0
 */
function connect() {
    if (socket) {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('close', onClose);
        socket.removeEventListener('error', onError);
        socket.removeEventListener('message', onMessage);
    }
    let { host, port } = devServer;
    let url = `ws://${host}:${port}`;
    socket = new WebSocket(url);
    socket.addEventListener('open', onOpen);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);
    socket.addEventListener('message', onMessage);
}
/**
 * @function connect
 * @since 0.1.0
 */
function reconnect() {
    if (socket) {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('close', onClose);
        socket.removeEventListener('message', onMessage);
        socket.close();
    }
    setTimeout(() => {
        console.warn('[Dezel Dev Server] - Reconnecting...');
        connect();
    }, 1000);
}
connect();
