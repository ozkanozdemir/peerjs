import Peer from 'peerjs'
import uid from 'uid'
import $ from 'jquery'
import openStream from './openStream'
import playVideo from './playVideo'

let myId = null
let connectedPeers = {};

const config = { host: 'peerjs-.herokuapp.com', port: 443, secure: true, key: 'peerjs' }
const peer = new Peer(getPeerId(), config)

function getPeerId() {
    myId = uid(10)
    $('#myPeerId').html(myId)
    return myId
}

function createText(data) {
    const text = '<li style="width:100%">' +
        '<div class="msj-rta macro">' +
        '<div class="avatar">' +
        '<img class="img-circle" style="width:100%;" src="https://cdn0.iconfinder.com/data/icons/iconshock_guys/512/matthew.png" /></div>' +
        '<div class="text text-r">' +
        '<p>'+ data.message +'</p>' +
        '<p><small>'+ data.id +'</small></p>' +
        '</div>' +
        '</div>' +
        '</li>';
    return text;
}

function createVideo(id) {
    const video = '<div class="col-xs-6">' +
        'Id : ' + id +
        '<video id="' + id +'" controls></video>' +
        '</div>'
    $("#cams").append(video)
}

function appendData(data) {
    $("#chat ul").append(createText(data))
}

//
function connectAndListen(friendId) {
    // connect to friend via id
    connectedPeers[friendId] = peer.connect(friendId)

    connectedPeers[friendId].on('data', data => {
        if (data.label === 'peers') {
            for (let p in data.peers) {
                if (data.peers[p] !== myId) {
                    connectedPeers[data.peers[p]] = peer.connect(data.peers[p])
                    connectedPeers[data.peers[p]].on('data', subData => {
                        if (subData.label !== 'peers') {
                            appendData(subData)
                        }
                    })
                }
            }
        } else {
            appendData(data)
        }
    })
}

// listen connection
peer.on('connection', function(conn) {
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

    conn.on('open', () => {
        conn.send({label: 'peers', peers: Object.keys(connectedPeers)})
    })

    // listen data
    conn.on('data', data => {
        appendData(data)
    })
})

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
$("#message").on("keyup", function(e){
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
    openStream(stream => {
        createVideo('localStream')
        playVideo(stream, 'localStream')
        for (let p in connectedPeers) {
            console.log(connectedPeers[p].peer + ' aranıyor.')
            const call = peer.call(connectedPeers[p].peer, stream)
        }
    })
})

// call answer
peer.on('call', call => {
    // show cams
    $('#cams').show()
    createVideo(call.peer)
    openStream(stream => {
        call.answer(stream)
        call.on('stream', remoteStream => {
            playVideo(remoteStream, call.peer)
        })
    })
})