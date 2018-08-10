//app setup
var io = require('socket.io-client');
var blessed = require('blessed');

// import blessed objects from cli directory
var screen = require('./cli/screen.js');
var input = require('./cli/input.js');
var body = require('./cli/body.js');
//var notification = require('./cli/notification.js');

// socket setup
var socket = io('http://localhost:4000');

// log function
const log = function (text) {
    body.pushLine(text);
    screen.render();
}

// notification function
const nofity = function (text) {
    notification.pushLine(text);
    screen.render();
}

// create a enterHandle form to identify client
var enterHandle = blessed.form({
    parent: screen,
    width: '90%',
    height: 10,
    left: 'center',
    keys: true,
    content: 'enter handle',
    vi: true
});

// create handle textbox
var handle = blessed.textbox({
    parent: enterHandle,
    name: 'handle',
    top: 4,
    left: 5,
    height: 3,
    inputOnFocus: true,
    content: 'first',
    border: {
        type: 'line'
    },
    focus: {
        fg: 'blue'
    }
});

// create submit button
var enter = blessed.button({
    parent: enterHandle,
    name: 'submit',
    content: 'Enter',
    top: 10,
    left: 5,
    shrink: true,
    padding: {
        top: 1,
        right: 2,
        bottom: 1,
        left: 2
    },
    style: {
        bold: true,
        fg: 'white',
        bg: 'green',
        focus: {
            inverse: true
        }
    }
});

// handle events
enter.on('press', function () {
    enterHandle.submit();
});

// handle submit
enterHandle.on('submit', function (data) {
    handle = data.handle;
    id = socket.io.engine.id
    socket.emit('submitHandle', {
        handle: handle,
        id: id
    });
});

// when user already exists
socket.on('failed', function() {
    enterHandle.content = 'That handle already exists. Please choose another handle.'
    screen.render();
})
    

// when connected for the first time
socket.on('connect', function() {
    screen.title = 'ultra chat';
    screen.append(enterHandle);
    screen.render();
});

// when the server authorizes the client to enter the chat
socket.on('enterChat', function() {
    screen.append(body);
    screen.append(input);

    // Handle submitting data
    input.on('submit', function(text) {
        input.clearValue();
        socket.emit('chat', {
            handle: handle,
            message: text
        })
        input.focus();
    });
    screen.render();
    screen.key('enter', function(ch, key) {
        input.focus();
    });
    input.focus();
});

// on chat message
socket.on('chat', function(data){
    totalMessage = data.handle + ": " + data.message
    log(totalMessage);
});

// on new user
socket.on('newUser', function(data) {
    log(data.caption);
});


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});
