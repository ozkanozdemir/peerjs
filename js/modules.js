import uid from 'uid'

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

// connect all peers and listen them
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

export {
    openStream,
    playVideo,
    getPeerId,
    createText,
    createVideo,
    appendData,
    connectAndListen
}