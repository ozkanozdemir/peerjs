function openStream(callbak) {
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(stream => {
            callbak(stream)

        })
        .catch(error => console.log(error))
}

module.exports = openStream