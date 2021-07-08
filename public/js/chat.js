// connect to socket.io
const clientSocket = io()

// ELEMENTS

const $messageForm = document.querySelector('#message-from')
const $messageFormBtn = $messageForm.querySelector('#form-submit')
const $messageFormInput = $messageForm.querySelector('#message-input')
const $locationSendBrn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML

const locationMesgTemplte = document.querySelector('#location-message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
// the query string from the url and converting it to an object using the library Qs
const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoScroller = () =>{

    // new message element
    const $newMessage = $messages.lastElementChild

    // get the styles of the last message element
    const newMessageStyles = getComputedStyle($newMessage)

    // convert the margin value to int
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    // Height of the new message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of the message container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight


    if (containerHeight - newMessageHeight <= scrollOffset){

        $messages.scrollTop = $messages.scrollHeight
    }

}


// join a room
clientSocket.emit('join',{username,room},

    // server acknowledgement callback function
    (acknowledgement)=>{
        if (acknowledgement.error){

            alert(acknowledgement.error)

            return  location.href= '/'
        }

        console.log(acknowledgement)
})


clientSocket.on('message', (message) => {

    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })

    $messages.insertAdjacentHTML('beforeend', html)

    autoScroller()
})


clientSocket.on('locationMessage', (message) => {
    console.log(message)

    const html = Mustache.render(locationMesgTemplte, {
        username:message.username,
        url: message.url,
        createdAt:moment(message.createdAt).format('h:mm A')

    })

    $messages.insertAdjacentHTML("beforeend", html)
})

$messageForm.addEventListener('submit',
    (e) => {

        e.preventDefault()

        $messageFormBtn.setAttribute('disabled', 'true')

        console.log($messageFormBtn)

        const message = e.target.elements.message.value

        clientSocket.emit('sendMessage', message,
            // acknowledgement function which will run after the server receive and processed the event
            (msg) => {

                $messageFormBtn.removeAttribute('disabled')

                $messageFormInput.value = ''
                $messageFormInput.focus()

                console.log(msg)
            })

        autoScroller()
    })


$locationSendBrn.addEventListener('click', () => {

    if (!navigator.geolocation) {

        return alert('Geolocation is not supported by your browser')
    }

    $locationSendBrn.setAttribute('disabled', 'true')

    navigator.geolocation.getCurrentPosition(
        (position) => {


            clientSocket.emit('sendLocation', {
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                },
                // acknowledgement function which will run after the server receive and processed the event
                (akg) => {
                    console.log(akg)

                    $locationSendBrn.removeAttribute('disabled')
                })
        }
    )

})


clientSocket.on('roomData',(roomData)=>{

    const html = Mustache.render(sidebarTemplate,{
        room:roomData.room,
        users:roomData.users
    })
    document.querySelector('#sidebar').innerHTML = html

    console.log( 'room data:',roomData)
})


// /**
//  * basic setup for client websockets setup
//  */
//
// // react to events from the webSocket server
// clientSocket.on('countUpdated', (count) => {
//     console.log('the count has been updated', count)
// })
//
// // send event to the websocket server
// document.querySelector('#inc').addEventListener('click',
//     (ev) => {
//
//
//         clientSocket.emit('increment')
//     })
//

