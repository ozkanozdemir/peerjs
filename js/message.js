import Peer from 'peerjs'
import uid from 'uid'
import $ from 'jquery'

let myId = null
let connectedPeers = {};

const config = { host: 'peerjs-.herokuapp.com', port: 443, secure: true, key: 'peerjs' }
const peer = new Peer(getPeer(), config)

function getPeer() {
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

// listen connection
peer.on('connection', function(conn) {
    $('#connectStatus').removeClass().addClass('text-info').html(conn.peer + ' connected with me.')
    $('#txtFriendId').val(conn.peer)
    $('#chat').show()
    connectedPeers[conn.peer] = conn

    console.log(conn.peer + ' bana bağlandı.')

    conn.on('open', () => {
        conn.send({label: 'peers', peers: Object.keys(connectedPeers)})
    })

    // listen data
    conn.on('data', data => {
        if (data.label === 'peers') {

        } else {
            $("#chat ul").append(createText(data))
        }
    })
})

peer.on('open', id => {
    console.log('My peer id is', id)
})

// connect button
$('#btnConnect').click(() => {
    // get id from input
    const friendId = $('#txtFriendId').val()

    // connect to friend via id
    connectedPeers[friendId] = peer.connect(friendId)

    connectedPeers[friendId].on('data', data => {
        if (data.label === 'peers') {
            for (let p in data.peers) {
                if (data.peers[p] !== myId) {
                    connectedPeers[data.peers[p]] = peer.connect(data.peers[p])
                    console.log(connectedPeers[data.peers[p]])
                    connectedPeers[data.peers[p]].on('data', data2 => {
                        console.log(data2)
                        if (data2.label !== 'peers') {
                            $("#chat ul").append(createText(data2))
                        }
                    })
                }
            }
        } else {
            $("#chat ul").append(createText(data))
        }
    })

    // if connected
    if (connectedPeers[friendId].peer !== '') {
        $('#connectStatus').removeClass().addClass('text-success').html('Connected with ' + friendId)
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
