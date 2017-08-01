import Peer from 'peerjs'
import uid from 'uid'
import $ from 'jquery'


function getPeer() {
    const myId = uid(10)
    $('#myPeerId').html(myId)
    return myId
}

const config = { host: 'peerjs-.herokuapp.com', port: 443, secure: true, key: 'peerjs' }
const peer = new Peer(getPeer(), config)

let $conn = null;


$('#btnConnect').click(() => {
    const friendId = $('#txtFriendId').val()

    $conn = peer.connect(friendId)

    if ($conn) {
        console.log('Connected!')
    }
})

$('#btnSend').click(() => {
    const message = $('#message').val()

    $conn.send(message)
})

peer.on('connection', function(conn) {
    console.log('Connected!')
    conn.on('data', data => {
        console.log('Received', data)
    })
})

peer.on('open', id => {
    console.log('My peer id is', id)
})


