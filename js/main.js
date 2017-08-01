import Peer from 'peerjs'
import uid from 'uid'
import $ from 'jquery'
import openStream from './openStream'
import playVideo from './playVideo'


function getPeer() {
    const myId = uid(10)
    $('#myPeerId').html(myId)
    return myId
}

const config = { host: 'peerjs-.herokuapp.com', port: 443, secure: true, key: 'peerjs' }
const peer = new Peer(getPeer(), config)

$('#btnCall').click(() => {
    const friendId = $('#txtFriendId').val()

    openStream(stream => {
        playVideo(stream, 'localStream')
        const call = peer.call(friendId, stream)

        console.log(call)

        call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'))
    })
})

peer.on('call', call => {
    openStream(stream => {
        playVideo(stream, 'localStream')
        call.answer(stream)
        call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'))

        console.log(call)
    })
})