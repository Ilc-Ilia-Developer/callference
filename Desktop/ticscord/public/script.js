const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const peers = []

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(document.getElementById('selfDisplay'), stream, true)

    myPeer.on('call', call=> {
        call.answer(stream)

        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        
        document.getElementsByClassName('waitingBlocker')[0].remove()
    })

    socket.on('user-connected', userId => {
        console.log("Connect")
        connectToNewUser(userId, stream)
    })

    if(countProps(peers) > 0)
        document.getElementsByClassName('waitingBlocker')[0].remove()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
    try{
        if(countProps(peers) > 0)
           document.getElementsByClassName('waitingBlocker')[0].remove()
    } catch(e){}
})

socket.on('user-connected', userId => {
    //userConnected();
    try{
        if(countProps(peers) > 0)
           document.getElementsByClassName('waitingBlocker')[0].remove()
    } catch(e){}
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call

    try{
        if(countProps(peers) > 0)
           document.getElementsByClassName('waitingBlocker')[0].remove()
    } catch(e){}
}

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
    peers.remove(userId)
})

function addVideoStream(video, stream, isMe = false) {
    if(!isMe){
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        videoGrid.append(video)
    }
    else {
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        video.muted = true;
    }
}