const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require("path");
const Filter = require('bad-words')
const {generateMessage, generateLocationMsg} = require('./utill/messages')
const {addUser, removeUser, getUser, findUsersInRoom} = require("./utill/users")

// start an express app
const app = express()

// create the http server by passing the express app
const server = http.createServer(app)

// pass the server to socket io to support webSocket
// this also will serve a the client js file used in client side as "/socket.io/socket.io.js" which is required to
// create a connection between nodeJS server and the client
const io = socketio(server)

// get the port from the environment variable is exist else use 3000
const port = process.env.PORT || 3000

const publicDirectory = path.join(__dirname, '../public')

// set the static content dir
app.use(express.static(publicDirectory))


let message = ''


io.on('connection', (currentSocket) => {

    console.log('new incoming client')


    // listen to clients joining rooms
    currentSocket.on('join', ({username, room}, callback) => {

        // using object distracting  addUser will either return an error or a user
        const {error, user} = addUser(currentSocket.id, username, room)

        if (error) {

            // use the acknowledgement callback passed from the client to notify that there is an error
            return callback({error: error})
        }

        // join is socket.io function that allows a connected client to join a specific room
        currentSocket.join(user.room)

        // emit an evnt to the current client
        currentSocket.emit('message', generateMessage('Chat App', 'welcome to chat room!'))

        // // this line will broadcast a value to all the other clients except the current client that is emitting this message
        // regardless what room they are in
        // currentSocket.broadcast.emit('message',generateMessage('A new user has joined'))

        // this line will broadcast a value to all the other clients except the current client that is emitting this message
        // also this call is using .to(room) by only sending the message to the clients in the this joined room not all the clients in the other rooms
        currentSocket.broadcast.to(user.room).emit('message', generateMessage('Chat App', `${user.username} has joined`))

        // get all the users in the same room and send back to the client along with the room name
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: findUsersInRoom(user.room)
        })

        callback('From server: you have joined successfully')
    })


    // listen to sendMessage event from the clients
    currentSocket.on('sendMessage', (message, cb) => {


        // get the user by id

        const user = getUser(currentSocket.id)

        const filter = new Filter()

        if (filter.isProfane(message)) {

            return cb('Profanity is not allowed!')
        }

        //
        // // emit the message event to all connected clients
        // io.emit('message',generateMessage(message))

        // emit the message event to  clients connected to the specified room in to()
        io.to(user.room).emit('message', generateMessage(user.username, message))

        // send an acknowledgment to the client to confirm that message was received
        cb('from server: your message was Delivered!')
    })


    // same logic in the sendMessage event above
    currentSocket.on('sendLocation', (location, cb) => {

        // get the user by id

        const user = getUser(currentSocket.id)

        const locationLink = `https://google.com/maps?q=${location.lat},${location.long}`

        io.to(user.room).emit('locationMessage', generateLocationMsg(user.username, locationLink))

        cb('from server: your location was Delivered!')
    })


    // emit an event when the current client drops the connection
    currentSocket.on('disconnect', () => {

        const user = removeUser(currentSocket.id)

        // only send a message to the other client in the room if the user successfully joined the room
        if (user) {
            io.to(user.room).emit('message', generateMessage('Chat app', `${user.username} has left`))

            // get all the users in the same room and send back to the client along with the room name
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: findUsersInRoom(user.room)
            })
        }
    })
})


/***
 * Basic setup example for server websockets. good starting reference
 */

// create an event listeners for socket io

// server (emit) -> client (receive) - countUpdated event
// client (emit) -> client (receive) - increment event

// listen to connections from the client and socket pram contains function we can use to communicate with each client
// that is connected to the webSocket server

// let count = 0
// io.on('connection', (socket) => {
//     console.log('new websocket connection')
//
//     // send an event to the current client
//     socket.emit('countUpdated',count)
//
//     // listen to events from the all the connected clients event name here is increment
//     socket.on('increment',()=>{
//
//         count++
//
//         // this line emits an event to current connected client that triggered the event
//         // socket.emit('countUpdated',count)
//
//         // this line emits an event to all the connected clients not a only the current client that triggered the event
//         io.emit('countUpdated',count)
//     })
// })


server.listen(port, () => {
    console.log('node server for chat app running on port', port)
})