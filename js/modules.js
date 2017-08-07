import uid from 'uid'
import $ from 'jquery'

let myId = null

// open stream of user browser
function openStream(callbak) {
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(stream => {
            callbak(stream)
        })
        .catch(error => console.log(error))
}

// play video
function playVideo(stream, idVideo) {
    const video = document.getElementById(idVideo)
    video.srcObject = stream
    video.play()
}

// create and get peer id (unique)
function getPeerId() {
    myId = uid(10)
    $('#myPeerId').html(myId)
    return myId
}

// create the chat dom
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

// create and append video element
function createVideo(id) {
    const video = '<div class="col-xs-6">' +
        'Id : ' + id +
        '<video id="' + id +'" controls></video>' +
        '</div>'
    $("#cams").append(video)
}

// append the data to chat box
function appendData(data) {
    $("#chat ul").append(createText(data))
}

// remove disabled attr from cam buttons
function activeCamButtons() {
    $('.btnCam').removeAttr('disabled')
    $('#btnCamRequest').removeAttr('disabled')
    $('#txtFriendIdForRequest').removeAttr('disabled')
}

// listen data
function listenData(conn, peer = null, connectedPeers = null) {
    conn.on('data', data => {
        if (data.label === 'message') {
            appendData(data)
        } else if (data.label === 'camRequest') {
            appendData({message: data.id + ' sent open cam request. <a href="#" class="btnCam">Open Cam</a>', id: data.id})
            $('.btnCam').click(window.openCam)
        } else if (data.label === 'peers') {
            console.log(data.peers)
            for (let p in data.peers) {
                if (data.peers[p] !== peer.id) {
                    console.log(1)
                    connectedPeers[data.peers[p]] = peer.connect(data.peers[p])
                    connectedPeers[data.peers[p]].on('data', subData => {
                        if (subData.label === 'message') {
                            appendData(subData)
                        }
                    })
                }
            }
        }
    })

    if (connectedPeers !== null) {
        return connectedPeers
    }
}


export {
    openStream,
    playVideo,
    getPeerId,
    createText,
    createVideo,
    appendData,
    activeCamButtons,
    listenData
}