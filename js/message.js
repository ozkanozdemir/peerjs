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
    appendData,
    connectAndListen
} from './modules'

let myId = null
let connectedPeers = {};

const config = { host: 'peerjs-.herokuapp.com', port: 443, secure: true, key: 'peerjs' }
const peer = new Peer(getPeerId(), config)



// listen connection
peer.on('connection', conn => {
    // update status text
    $('#connectStatus').removeClass().addClass('text-info').html(conn.peer + ' connected with me.')
    // show chat box
    $('#chat').show()

    // activate open cam button, disable connect button
    $('#btnCam').removeAttr('disabled')
    $('#btnConnect').attr('disabled', 'disabled')

    console.log(conn.peer + ' bana bağlandı.')

    // connect
    connectedPeers[conn.peer] = conn

    // listen open status of connecting
    conn.on('open', () => {
        conn.send({label: 'peers', peers: Object.keys(connectedPeers)})
    })

    // listen data
    conn.on('data', data => {
        appendData(data)
    })
})

// listen open status of the peer object
peer.on('open', id => {
    console.log('My peer id is', id)
})

// listen connect button
$('#btnConnect').click(() => {
    // get id from input
    const friendId = $('#txtFriendId').val()

    // activate open cam button, disable connect button
    $('#btnCam').removeAttr('disabled')
    $('#btnConnect').attr('disabled', 'disabled')

    // run connect and listen function
    connectAndListen(friendId)

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
    if (e.which === 13){
        const message = $(this).val();
        if (message !== ""){
            // send message
            for (var connectedPeer in connectedPeers) {
                const c = connectedPeers[connectedPeer]
                c.send({message: message, id: myId})
            }
            $("#chat ul").append(createText({message: message, id: 'Ben'}));
            $(this).val('');
        }
    }
})

// listen open cam button
$('#btnCam').click(() => {
    // show cams
    $('#cams').show()
    // disable cam button
    $('#btnCam').attr('disabled', 'disabled')
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
})

// listen call of peer object
peer.on('call', call => {
    // show cams
    $('#cams').show()
    // create video element for remote stream
    createVideo(call.peer)
    // send answer to the call
    call.answer('success')
    // listen stream of the call
    call.on('stream', remoteStream => playVideo(remoteStream, call.peer))
})