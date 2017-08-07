// core
import Peer from 'peerjs'
import $ from 'jquery'

// import modules
import {
    openStream,
    playVideo,
    getPeerId,
    createText,
    createVideo,
    activeCamButtons,
    listenData
} from './modules'

// list of the peers
let connectedPeers = {};
const myId = getPeerId()

// create new peer object
const config = { host: 'peerjs-.herokuapp.com', port: 443, secure: true, key: 'peerjs' }
const peer = new Peer(myId, config)

// open cam function
window.openCam = () => {
    // show cams
    $('#cams').show()
    // disable cam button
    $('.btnCam').attr('disabled', 'disabled')
    // create video element for local stream
    createVideo('localStream')
    // open local stream
    openStream(stream => {
        playVideo(stream, 'localStream')
        // send local stream to the others
        for (let p in connectedPeers) {
            const call = peer.call(connectedPeers[p].peer, stream)
            call.on('answer', answer => console.log(answer))
        }
    })
}

$('.btnCam').click(openCam)

// listen connection
peer.on('connection', conn => {
    // update status text
    $('#connectStatus').removeClass().addClass('text-info').html(conn.peer + ' connected with me.')
    // show chat box
    $('#chat').show()

    // activate open cam button, disable connect button
    activeCamButtons()
    $('#btnConnect').attr('disabled', 'disabled')

    console.log(conn.peer + ' bana bağlandı.')

    // add list the connect
    connectedPeers[conn.peer] = conn

    // listen open status of connecting
    conn.on('open', () => {
        conn.send({label: 'peers', peers: Object.keys(connectedPeers)})
    })

    // listen data
    listenData(conn, peer, connectedPeers)
})

// listen open status of the peer object
peer.on('open', id => {
    console.log('My peer id is', id)
})

// listen connect button
$('#btnConnect').click(() => {
    // get id from input
    const friendId = $('#txtFriendId').val()

    // activate open cam buttons, disable connect button
    activeCamButtons()
    $('#btnConnect').attr('disabled', 'disabled')

    // connect to friend via id
    connectedPeers[friendId] = peer.connect(friendId)

    // listen the peer
    connectedPeers = listenData(connectedPeers[friendId], peer, connectedPeers)
    console.log(connectedPeers)

    // if connected
    if (connectedPeers[friendId].peer !== '') {
        // update status text
        $('#connectStatus').removeClass().addClass('text-success').html('Connected with ' + friendId)
        // show chat box
        $('#chat').show()
    }
})

// listen message input
$("#message").on("keyup", e => {
    // listen press enter
    if (e.which === 13){
        const message = $("#message").val();
        if (message !== ""){
            // send message to all peers
            for (var connectedPeer in connectedPeers) {
                const c = connectedPeers[connectedPeer]
                c.send({label: 'message', message: message, id: myId})
            }
            $("#chat ul").append(createText({message: message, id: 'Ben'}));
            $('#message').val('');
        }
    }
})

// listen open cam request
$('#btnCamRequest').click(() => {
    const friendId =$('#txtFriendIdForRequest').val()
    connectedPeers[friendId].send({label: 'camRequest', id: myId})
})

// listen call of peer object
peer.on('call', call => {
    // show cams
    $('#cams').show()
    // create video element for remote stream
    createVideo(call.peer)
    openStream(stream => {
        // send answer to the call
        call.answer(stream)
    })
    // listen stream of the call
    call.on('stream', remoteStream => {
        playVideo(remoteStream, call.peer)
    })
})
