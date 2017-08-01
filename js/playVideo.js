function playVdeo(stream, idVideo) {
    const video = document.getElementById(idVideo)
    video.srcObject = stream
    video.play()
}

module.exports = playVdeo